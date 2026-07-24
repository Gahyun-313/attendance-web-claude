// 로그인 화면. 사이드바가 없는 단독 페이지라 router.tsx에서 Layout 밖에 따로 등록돼있다.
// 2026-07-24 STEP22: mode 상태로 로그인/가입 화면을 한 페이지에서 토글하도록 확장.
//   - 로그인 모드: 기존 아이디/비밀번호 폼 + 이미 연동된 구글/카카오 계정으로 로그인
//   - 가입 모드: 단체 코드 입력 + 구글/카카오로 가입 또는 이메일 인증(코드 발송 → 코드 확인) 2단계 가입
// 로그인/가입 어느 경로든 성공하면 handleAuthSuccess()가 토큰/사용자 정보를 저장하고 대시보드('/')로 이동
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { login, oauthLogin, requestEmailJoinCode, verifyEmailJoinCode } from '../api/auth'
import type { ApiErrorResponse } from '../types/common'
import type { LoginResponse, OAuthProvider } from '../types/auth'
import type { GoogleCredentialResponse } from '../types/oauth'
import { loadScript } from '../utils/loadScript'
import { Button, Input } from '../components'

// 구글/카카오 콘솔에서 발급받은 값 - .env에 채워넣지 않으면 해당 소셜 버튼 클릭 시 안내 메시지만 뜨고 동작하지 않음
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY as string | undefined

type Mode = 'login' | 'signup'
type JoinStep = 'request' | 'verify'

const EmailIcon = () => (
  <svg className="size-4 text-gray-500" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
    <rect x="2.5" y="4.5" width="15" height="11" rx="1.5" />
    <path d="m3 5.5 7 5 7-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const LockIcon = () => (
  <svg className="size-4 text-gray-500" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
    <rect x="4" y="9" width="12" height="8" rx="1.5" />
    <path d="M6.5 9V6.5a3.5 3.5 0 0 1 7 0V9" strokeLinecap="round" />
  </svg>
)

const BuildingIcon = () => (
  <svg className="size-4 text-gray-500" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
    <rect x="4" y="2.5" width="12" height="15" rx="1" />
    <path d="M7.5 6h1M11.5 6h1M7.5 9h1M11.5 9h1M7.5 12h1M11.5 12h1" strokeLinecap="round" />
  </svg>
)

// ===== UI: 소셜 로그인 버튼 아이콘 - 실제 브랜드 로고 asset 대신 색상만 브랜드 톤에 맞춘 간단한 도형 =====
const GoogleMark = () => (
  <span className="flex size-4 items-center justify-center rounded-full bg-white text-[11px] font-bold text-[#4285F4] ring-1 ring-[#dcdfe4]">
    G
  </span>
)

const KakaoMark = () => (
  <svg className="size-4" viewBox="0 0 20 20" fill="#3C1E1E">
    <ellipse cx="10" cy="9.5" rx="8" ry="6.5" />
  </svg>
)

// axios 에러면 서버가 내려준 메시지를, 그 외엔 fallback 문구를 돌려주는 공통 헬퍼
const extractError = (error: unknown, fallback: string): string | null => {
  if (!error) return null
  if (axios.isAxiosError<ApiErrorResponse>(error)) return error.response?.data?.message ?? fallback
  return fallback
}

const LoginPage = () => {
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('login')

  // ===== 로그인 모드 폼 상태 =====
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)

  // ===== 가입 모드 폼 상태 - organizationCode는 소셜 가입/이메일 가입 공통으로 사용 =====
  const [organizationCode, setOrganizationCode] = useState('')
  const [joinStep, setJoinStep] = useState<JoinStep>('request')
  const [joinEmail, setJoinEmail] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [joinPassword, setJoinPassword] = useState('')
  const [joinName, setJoinName] = useState('')

  // 소셜 로그인 SDK 자체 문제(스크립트 로드 실패, 환경변수 누락 등) 안내용 - 서버 에러(axios)와 별도로 관리
  const [socialError, setSocialError] = useState<string | null>(null)

  // 구글 One Tap 콜백은 최초 initialize() 시 딱 한 번만 등록되는데, 그 안에서 mode/organizationCode 같은
  // 리액트 상태를 직접 참조하면 등록 시점 값에 갇히는 stale closure가 됨.
  // 그래서 실제 처리 함수는 ref에 담아두고, 매 렌더마다 최신 값으로 갱신한다 (콜백은 ref를 통해서만 호출)
  const googleCallbackRef = useRef<(response: GoogleCredentialResponse) => void>(() => {})
  const googleInitialized = useRef(false)

  const handleAuthSuccess = useCallback(
    (data: LoginResponse) => {
      // TODO: "로그인 유지" 체크 여부에 따라 localStorage/sessionStorage를 나누는 로직은
      // 필요해지면 그때 추가 (지금은 단순하게 항상 localStorage에 저장)
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/')
    },
    [navigate],
  )

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: handleAuthSuccess,
  })

  // 구글/카카오 공용 - provider별 SDK로 먼저 받은 토큰을 백엔드에 그대로 전달.
  // organizationCode는 가입 모드일 때만 실어 보냄(로그인 모드는 이미 연동된 기존 계정이라 불필요)
  const oauthMutation = useMutation({
    mutationFn: ({ provider, token }: { provider: OAuthProvider; token: string }) =>
      oauthLogin(provider, {
        token,
        organizationCode: mode === 'signup' ? organizationCode.trim() : undefined,
      }),
    onSuccess: handleAuthSuccess,
  })

  const requestJoinMutation = useMutation({
    mutationFn: requestEmailJoinCode,
    onSuccess: () => setJoinStep('verify'),
  })

  const verifyJoinMutation = useMutation({
    mutationFn: verifyEmailJoinCode,
    onSuccess: handleAuthSuccess,
  })

  useEffect(() => {
    googleCallbackRef.current = (response) => {
      oauthMutation.mutate({ provider: 'google', token: response.credential })
    }
  })

  const errorMessage =
    extractError(loginMutation.error, '로그인에 실패했어요. 다시 시도해주세요.') ??
    extractError(oauthMutation.error, '소셜 로그인에 실패했어요. 다시 시도해주세요.') ??
    extractError(requestJoinMutation.error, '인증 코드 발송에 실패했어요. 단체 코드와 이메일을 확인해주세요.') ??
    extractError(verifyJoinMutation.error, '가입에 실패했어요. 인증 코드를 확인해주세요.') ??
    socialError

  // 구글 Identity Services 스크립트를 불러오고, 아직 초기화 전이면 initialize()까지 한 번만 실행
  const ensureGoogleReady = async () => {
    if (!GOOGLE_CLIENT_ID) {
      setSocialError('구글 로그인이 아직 설정되지 않았어요. (.env의 VITE_GOOGLE_CLIENT_ID 필요)')
      return false
    }
    setSocialError(null)
    await loadScript('https://accounts.google.com/gsi/client')
    if (!window.google) {
      setSocialError('구글 로그인 스크립트를 불러오지 못했어요. 잠시 후 다시 시도해주세요.')
      return false
    }
    if (!googleInitialized.current) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        // 콜백 자체는 한 번만 등록하고, 실제 처리는 항상 최신 상태를 담고 있는 ref로 위임
        callback: (response) => googleCallbackRef.current(response),
      })
      googleInitialized.current = true
    }
    return true
  }

  const handleGoogleLogin = async () => {
    if (mode === 'signup' && !organizationCode.trim()) {
      setSocialError('단체 코드를 먼저 입력해주세요.')
      return
    }
    const ready = await ensureGoogleReady()
    if (!ready || !window.google) return
    window.google.accounts.id.prompt()
  }

  const handleKakaoLogin = async () => {
    if (mode === 'signup' && !organizationCode.trim()) {
      setSocialError('단체 코드를 먼저 입력해주세요.')
      return
    }
    if (!KAKAO_JS_KEY) {
      setSocialError('카카오 로그인이 아직 설정되지 않았어요. (.env의 VITE_KAKAO_JS_KEY 필요)')
      return
    }
    setSocialError(null)
    await loadScript('https://developers.kakao.com/sdk/js/kakao.js')
    if (!window.Kakao) {
      setSocialError('카카오 로그인 스크립트를 불러오지 못했어요. 잠시 후 다시 시도해주세요.')
      return
    }
    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(KAKAO_JS_KEY)
    }
    window.Kakao.Auth.login({
      success: (authObj) => oauthMutation.mutate({ provider: 'kakao', token: authObj.access_token }),
      fail: () => setSocialError('카카오 로그인에 실패했어요. 다시 시도해주세요.'),
    })
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    // 2026-07-23 확인: 실제 관리자 계정 username은 "admin"처럼 평범한 문자열이고 이메일 형식이 아님
    // (Figma 시안엔 "이메일"로 표기돼 있지만 백엔드는 그냥 username 문자열을 받음 - UI 라벨/placeholder는 시안 유지)
    loginMutation.mutate({ username, password })
  }

  const handleRequestJoinCode = (e: FormEvent) => {
    e.preventDefault()
    requestJoinMutation.mutate({ organizationCode: organizationCode.trim(), email: joinEmail.trim() })
  }

  const handleVerifyJoinCode = (e: FormEvent) => {
    e.preventDefault()
    verifyJoinMutation.mutate({
      email: joinEmail.trim(),
      code: joinCode.trim(),
      password: joinPassword,
      name: joinName.trim(),
    })
  }

  // 로그인 ↔ 가입 전환 시 가입 하위 단계/에러 상태를 초기화 (다른 모드로 넘어갔다가 되돌아왔을 때 이전 에러가 남지 않게)
  const switchMode = (next: Mode) => {
    setMode(next)
    setJoinStep('request')
    setSocialError(null)
  }

  const isSocialPending = oauthMutation.isPending

  return (
    <div className="flex min-h-screen w-full">
      {/* ===== UI: 왼쪽 히어로 - 마케팅 톤이라 내부 화면(gray-800)과 다르게 파란색 사용, lg 미만에선 hidden ===== */}
      <div className="relative hidden w-1/2 flex-col justify-center overflow-hidden bg-linear-to-br from-blue-500 to-blue-700 px-16 py-12 text-white lg:flex">
        <div className="mb-10 flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-white/15 text-lg">)~</div>
          <span className="text-lg font-bold">출석하자</span>
        </div>
        <p className="mb-3 text-xs font-semibold tracking-widest text-blue-200">NFC ATTENDANCE · ADMIN</p>
        <h1 className="mb-4 text-4xl font-extrabold leading-tight">
          NFC 한 번이면
          <br />
          출석 끝.
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-blue-100">
          교실 입구 NFC 태그로 출석을 자동 기록하고, 관리자는 웹에서 한 눈에 확인합니다. 학교, 학원, 스터디,
          동아리에서 사용하세요.
        </p>
        {/* TODO: Figma 원본의 폰/태그 일러스트 이미지 asset은 넣지 않음 - 필요하면 직접 추가 */}
      </div>

      {/* ===== UI: 오른쪽 로그인/가입 폼 ===== */}
      <div className="flex w-full flex-1 items-center justify-center bg-white px-6 py-10 lg:w-1/2">
        <div className="w-full max-w-md">
          {mode === 'login' ? (
            <>
              <h2 className="mb-1 text-2xl font-bold text-gray-800">관리자 로그인</h2>
              <p className="mb-8 text-sm text-gray-500">출석하자 관리자 계정으로 로그인하세요.</p>

              <form onSubmit={handleSubmit}>
                {/* ===== UI: 아이디/비밀번호 입력칸 ===== */}
                <div className="mb-4">
                  <Input
                    label={
                      <>
                        <EmailIcon /> 이메일
                      </>
                    }
                    type="text"
                    placeholder="admin@hb.ac.kr"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-4">
                  <Input
                    label={
                      <>
                        <LockIcon /> 비밀번호
                      </>
                    }
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {/* ===== UI: 로그인 유지 체크박스 + 비밀번호 찾기 링크(비활성) ===== */}
                <div className="mb-6 flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-gray-700">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="size-4 rounded border-gray-300"
                    />
                    로그인 유지
                  </label>
                  {/* TODO: 비밀번호 재설정 플로우는 백엔드 API가 아직 없음 (§9 참고) - 연결 안 함 */}
                  <span className="cursor-not-allowed font-medium text-blue-600" title="아직 지원하지 않는 기능">
                    비밀번호를 잊으셨나요?
                  </span>
                </div>

                {errorMessage && <p className="mb-4 text-sm text-red-600">{errorMessage}</p>}

                {/* ===== UI: 로그인 버튼 - variant="brand"는 로그인 화면 전용 파란색(다른 화면 primary와 다름) ===== */}
                <Button type="submit" variant="brand" className="w-full" disabled={loginMutation.isPending}>
                  {loginMutation.isPending ? '로그인 중...' : '로그인'}
                </Button>
              </form>

              {/* ===== UI: 구분선 + 소셜 로그인 ===== */}
              <div className="my-6 flex items-center gap-3 text-xs text-gray-400">
                <div className="h-px flex-1 bg-gray-200" />
                또는
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              <div className="flex flex-col gap-2.5">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex w-full items-center justify-center gap-2"
                  onClick={handleGoogleLogin}
                  disabled={isSocialPending}
                >
                  <GoogleMark /> Google로 로그인
                </Button>
                <Button
                  type="button"
                  variant="kakao"
                  className="flex w-full items-center justify-center gap-2"
                  onClick={handleKakaoLogin}
                  disabled={isSocialPending}
                >
                  <KakaoMark /> Kakao로 로그인
                </Button>
              </div>

              {/* ===== UI: 가입 모드로 전환 ===== */}
              <p className="mt-6 text-center text-sm text-gray-500">
                계정이 없으신가요?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="font-semibold text-blue-600 hover:underline"
                >
                  가입 →
                </button>
              </p>
            </>
          ) : (
            <>
              <h2 className="mb-1 text-2xl font-bold text-gray-800">관리자 가입</h2>
              <p className="mb-8 text-sm text-gray-500">
                소속 단체 코드를 입력하고 구글/카카오 계정 또는 이메일 인증으로 가입하세요.
              </p>

              {/* ===== UI: 단체 코드 - 소셜 가입/이메일 가입 공통 입력 ===== */}
              <div className="mb-4">
                <Input
                  label={
                    <>
                      <BuildingIcon /> 단체 코드
                    </>
                  }
                  type="text"
                  placeholder="ATT-DEFAULT"
                  value={organizationCode}
                  onChange={(e) => setOrganizationCode(e.target.value)}
                  disabled={joinStep === 'verify'}
                  required
                />
              </div>

              {errorMessage && <p className="mb-4 text-sm text-red-600">{errorMessage}</p>}

              {/* ===== UI: 구글/카카오로 가입 ===== */}
              <div className="mb-6 flex flex-col gap-2.5">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex w-full items-center justify-center gap-2"
                  onClick={handleGoogleLogin}
                  disabled={isSocialPending}
                >
                  <GoogleMark /> Google로 가입하기
                </Button>
                <Button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 bg-[#FEE500] text-[#3C1E1E] hover:bg-[#f5dc00]"
                  onClick={handleKakaoLogin}
                  disabled={isSocialPending}
                >
                  <KakaoMark /> Kakao로 가입하기
                </Button>
              </div>

              <div className="mb-6 flex items-center gap-3 text-xs text-gray-400">
                <div className="h-px flex-1 bg-gray-200" />
                또는 이메일로 가입
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              {/* ===== UI: 이메일 인증 가입 - 1단계(코드 요청) / 2단계(코드+정보 확인)를 joinStep으로 전환 ===== */}
              {joinStep === 'request' ? (
                <form onSubmit={handleRequestJoinCode}>
                  <div className="mb-6">
                    <Input
                      label={
                        <>
                          <EmailIcon /> 이메일
                        </>
                      }
                      type="email"
                      placeholder="you@example.com"
                      value={joinEmail}
                      onChange={(e) => setJoinEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" variant="brand" className="w-full" disabled={requestJoinMutation.isPending}>
                    {requestJoinMutation.isPending ? '코드 발송 중...' : '인증 코드 받기'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyJoinCode}>
                  <p className="mb-4 text-sm text-gray-500">
                    <span className="font-medium text-gray-700">{joinEmail}</span>로 보낸 인증 코드를 입력해주세요.
                  </p>
                  <div className="mb-4">
                    <Input
                      label="인증 코드"
                      type="text"
                      placeholder="6자리 코드"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <Input
                      label={
                        <>
                          <LockIcon /> 비밀번호
                        </>
                      }
                      type="password"
                      value={joinPassword}
                      onChange={(e) => setJoinPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-6">
                    <Input
                      label="이름"
                      type="text"
                      value={joinName}
                      onChange={(e) => setJoinName(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" variant="brand" className="w-full" disabled={verifyJoinMutation.isPending}>
                    {verifyJoinMutation.isPending ? '가입 처리 중...' : '가입 완료'}
                  </Button>
                  <div className="mt-3 flex justify-between text-sm">
                    <button
                      type="button"
                      onClick={() => setJoinStep('request')}
                      className="text-gray-500 hover:underline"
                    >
                      ← 이메일 다시 입력
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        requestJoinMutation.mutate({ organizationCode: organizationCode.trim(), email: joinEmail.trim() })
                      }
                      disabled={requestJoinMutation.isPending}
                      className="font-medium text-blue-600 hover:underline disabled:cursor-not-allowed disabled:text-gray-400"
                    >
                      코드 재전송
                    </button>
                  </div>
                </form>
              )}

              {/* ===== UI: 로그인 모드로 전환 ===== */}
              <p className="mt-6 text-center text-sm text-gray-500">
                이미 계정이 있으신가요?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="font-semibold text-blue-600 hover:underline"
                >
                  로그인 →
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoginPage
