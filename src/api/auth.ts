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
