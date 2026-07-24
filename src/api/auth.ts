// 인증 관련 API 함수 모음 (로그인/로그아웃/토큰 갱신/소셜 로그인/이메일 인증 가입). 실제 요청은 axiosClient가 처리하고
// 여긴 각 엔드포인트별 요청/응답 타입만 지정해주는 얇은 wrapper
import axiosClient from './axiosClient'
import type { ApiResponse } from '../types/common'
import type {
  EmailJoinRequest,
  EmailJoinVerifyRequest,
  LoginRequest,
  LoginResponse,
  OAuthLoginRequest,
  OAuthProvider,
} from '../types/auth'

export const login = async (req: LoginRequest): Promise<LoginResponse> => {
  const { data } = await axiosClient.post<ApiResponse<LoginResponse>>('/auth/login', req)
  return data.data
}

// 소셜 로그인 - provider는 'google'|'kakao', token은 각 SDK로 프론트에서 먼저 받은 값 그대로 전달
export const oauthLogin = async (provider: OAuthProvider, req: OAuthLoginRequest): Promise<LoginResponse> => {
  const { data } = await axiosClient.post<ApiResponse<LoginResponse>>(`/auth/oauth/${provider}`, req)
  return data.data
}

// 이메일 인증 가입 1단계 - 성공하면 입력한 이메일로 6자리 코드가 발송됨 (응답 바디는 딱히 없음)
export const requestEmailJoinCode = async (req: EmailJoinRequest): Promise<void> => {
  await axiosClient.post('/auth/join/email/request', req)
}

// 이메일 인증 가입 2단계 - 코드 확인 후 계정 생성 + 즉시 로그인 처리(로그인과 동일한 토큰 응답)
export const verifyEmailJoinCode = async (req: EmailJoinVerifyRequest): Promise<LoginResponse> => {
  const { data } = await axiosClient.post<ApiResponse<LoginResponse>>('/auth/join/email/verify', req)
  return data.data
}

export const logout = async (): Promise<void> => {
  await axiosClient.post('/auth/logout')
}

// 2026-07-25: 401 자동 갱신은 axiosClient.ts의 응답 인터셉터가 순환참조 방지를 위해 별도 axios
// 인스턴스로 직접 처리함(이 함수를 재사용하지 않음) - 이 함수는 화면에서 수동으로 갱신을 트리거하고 싶을 때 대비해 유지
export const refresh = async (refreshToken: string): Promise<LoginResponse> => {
  const { data } = await axiosClient.post<ApiResponse<LoginResponse>>('/auth/refresh', {
    refreshToken,
  })
  return data.data
}
