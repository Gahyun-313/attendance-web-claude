import type { User } from './user'

export interface LoginRequest {
  username: string
  password: string
}

// 2026-07-23 실제 로그인 응답으로 확인 완료 (더 이상 추정 아님)
export interface LoginResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: string
  user: User
}
