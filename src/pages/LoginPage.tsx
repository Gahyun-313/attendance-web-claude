// 로그인 화면. 사이드바가 없는 단독 페이지라 router.tsx에서 Layout 밖에 따로 등록돼있다.
// 로그인 성공 시 토큰/사용자 정보를 localStorage에 저장하고 대시보드('/')로 이동한다
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { login } from '../api/auth'
import type { ApiErrorResponse } from '../types/common'
import { Button, Input } from '../components'

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

const LoginPage = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      // TODO: "로그인 유지" 체크 여부에 따라 localStorage/sessionStorage를 나누는 로직은
      // 필요해지면 그때 추가 (지금은 단순하게 항상 localStorage에 저장)
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/')
    },
  })

  const errorMessage = axios.isAxiosError<ApiErrorResponse>(loginMutation.error)
    ? loginMutation.error.response?.data?.message
    : loginMutation.error && '로그인에 실패했어요. 다시 시도해주세요.'

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    // 2026-07-23 확인: 실제 관리자 계정 username은 "admin"처럼 평범한 문자열이고 이메일 형식이 아님
    // (Figma 시안엔 "이메일"로 표기돼 있지만 백엔드는 그냥 username 문자열을 받음 - UI 라벨/placeholder는 시안 유지)
    loginMutation.mutate({ username, password })
  }

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

      {/* ===== UI: 오른쪽 로그인 폼 ===== */}
      <div className="flex w-full flex-1 items-center justify-center bg-white px-6 lg:w-1/2">
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <h2 className="mb-1 text-2xl font-bold text-gray-800">관리자 로그인</h2>
          <p className="mb-8 text-sm text-gray-500">출석하자 관리자 계정으로 로그인하세요.</p>

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

          {/* ===== UI: 로그인 실패 에러 메시지 (있을 때만 표시) ===== */}
          {errorMessage && <p className="mb-4 text-sm text-red-600">{errorMessage}</p>}

          {/* ===== UI: 로그인 버튼 - variant="brand"는 로그인 화면 전용 파란색(다른 화면 primary와 다름) ===== */}
          <Button type="submit" variant="brand" className="w-full" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? '로그인 중...' : '로그인'}
          </Button>

          {/* ===== UI: 회원가입 링크(비활성) ===== */}
          <p className="mt-6 text-center text-sm text-gray-500">
            계정이 없으신가요?{' '}
            {/* TODO: 관리자 회원가입 API가 아직 없음 (§9 - oauth/login만 "추후") - 연결 안 함 */}
            <span className="cursor-not-allowed font-semibold text-blue-600" title="아직 지원하지 않는 기능">
              회원가입 →
            </span>
          </p>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
