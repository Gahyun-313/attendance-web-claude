import type { User } from './user'

export interface LoginRequest {
  username: string
  password: string
}

// 2026-07-23 실제 로그인 응답으로 확인 완료 (더 이상 추정 아님)
// 2026-07-24: 소셜 로그인/이메일 인증 가입 응답도 동일한 구조를 그대로 씀(api-specification.md 확인) -
// user는 로그인과 똑같이 {id, username, name, role, passwordChanged}만 포함되고 organizationId/email/provider는 없음
export interface LoginResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: string
  user: User
}

// 2026-07-24: 소셜 로그인(구글/카카오) - multi-tenancy-plan.md 기준.
// provider별 SDK(구글 Identity Services/카카오 JS SDK)로 프론트에서 먼저 토큰을 받은 뒤 그대로 백엔드에 전달하면,
// 백엔드가 각 provider API로 토큰을 검증하는 구조 (Spring Security의 리다이렉트 방식이 아님)
export type OAuthProvider = 'google' | 'kakao'

export interface OAuthLoginRequest {
  token: string
  // 기존에 연동된 계정이면 불필요, 신규 조인(해당 단체 첫 로그인)일 때만 필수 - 프론트는 항상 같이 보내고
  // 서버가 필요 여부를 판단함(없는데 신규 계정이면 O002 에러로 응답)
  organizationCode?: string
}

// 소셜 로그인이 차단된 환경을 위한 대체 조인 경로 1단계 - 이메일로 6자리 인증 코드 발송 요청
export interface EmailJoinRequest {
  organizationCode: string
  email: string
}

// 대체 조인 경로 2단계 - 인증 코드 확인 + 계정 생성(비밀번호/이름 지정)
export interface EmailJoinVerifyRequest {
  email: string
  code: string
  password: string
  name: string
}

// 2026-08-18: 로그아웃 상태(비밀번호 분실)용 재설정 - 로그인된 본인이 쓰는 PATCH /api/users/me/password와는 다른 기능.
// 소셜 로그인 전용 계정(provider != null)은 대상 아님(O007)
export interface PasswordResetRequest {
  email: string
}

// 성공해도 자동 로그인은 안 됨 - 새 비밀번호로 /api/auth/login을 다시 호출해야 함
export interface PasswordResetVerifyRequest {
  email: string
  code: string
  newPassword: string
}
