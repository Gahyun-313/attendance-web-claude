// 2026-07-23 실제 로그인 응답으로 확인된 구조 (data.user)
export type UserRole = 'ADMIN' | 'STUDENT'

export interface User {
  id: number
  username: string
  name: string
  role: UserRole
  passwordChanged: boolean
}
