// 2026-07-23 실제 로그인 응답으로 확인된 구조 (data.user)
export type UserRole = 'ADMIN' | 'STUDENT'

export interface User {
  id: number
  username: string
  name: string
  role: UserRole
  passwordChanged: boolean
}

// 로그인된 본인 비밀번호 변경 요청 (PATCH /api/users/me/password, 2026-08-20 api-specification.md #8 수정본으로
// 확정: currentPassword/newPassword, 에러코드 U005=비밀번호 불일치) - STEP29-2의 로그아웃 상태 비밀번호 재설정
// (PasswordResetRequest, types/auth.ts)과는 다른 기능
export interface PasswordChangeRequest {
  currentPassword: string
  newPassword: string
}
