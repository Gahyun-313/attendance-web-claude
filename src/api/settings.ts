// 설정 API. 2026-08-19(STEP29-5): BE 신규 API 공지로 실제 백엔드에 연동함 - 더 이상 MSW mock 아님
// (mocks/handlers.ts의 관련 mock 핸들러도 이 STEP에서 같이 제거함)
// 유예/지각 분 값은 서버가 0 이상만 허용(음수면 400)
import axiosClient from './axiosClient'
import type { ApiResponse } from '../types/common'
import type { OrganizationSettings, OrganizationUpdateRequest } from '../types/settings'

export const getOrganization = async (): Promise<OrganizationSettings> => {
  const { data } = await axiosClient.get<ApiResponse<OrganizationSettings>>('/organizations/me')
  return data.data
}

export const updateOrganization = async (req: OrganizationUpdateRequest): Promise<OrganizationSettings> => {
  const { data } = await axiosClient.put<ApiResponse<OrganizationSettings>>('/organizations/me', req)
  return data.data
}
