// 인증 관련 API 함수 모음 (로그인/로그아웃/토큰 갱신). 실제 요청은 axiosClient가 처리하고
// 여긴 각 엔드포인트별 요청/응답 타입만 지정해주는 얇은 wrapper
import axiosClient from './axiosClient'
import type { ApiResponse } from '../types/common'
import type { LoginRequest, LoginResponse } from '../types/auth'

export const login = async (req: LoginRequest): Promise<LoginResponse> => {
  const { data } = await axiosClient.post<ApiResponse<LoginResponse>>('/auth/login', req)
  return data.data
}

export const logout = async (): Promise<void> => {
  await axiosClient.post('/auth/logout')
}

// TODO: 요청 바디 형태(refreshToken을 body로 보내는지, 헤더로 보내는지)는 실제 연동 때 확인 필요
export const refresh = async (refreshToken: string): Promise<LoginResponse> => {
  const { data } = await axiosClient.post<ApiResponse<LoginResponse>>('/auth/refresh', {
    refreshToken,
  })
  return data.data
}
