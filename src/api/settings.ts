// 설정 API - 백엔드에 아직 없어서 현재는 MSW로만 mock 처리됨(src/mocks/handlers.ts, STEP3).
// baseURL은 다른 도메인과 동일하게 axiosClient를 그대로 쓰기 때문에, 나중에 실제 백엔드 API가 생기면
// 이 파일은 손댈 필요 없이 mocks/handlers.ts의 해당 핸들러만 지우면 자동으로 실제 서버를 타게 됨
// (단, 실제 응답 모양이 mock과 다르면 요청/응답 타입은 다시 확인 필요)
import axiosClient from './axiosClient'
import type { ApiResponse } from '../types/common'
import type { AttendancePolicySettings, OrganizationSettings } from '../types/settings'

export const getOrganizationSettings = async (): Promise<OrganizationSettings> => {
  const { data } = await axiosClient.get<ApiResponse<OrganizationSettings>>('/settings/organization')
  return data.data
}

export const updateOrganizationSettings = async (req: OrganizationSettings): Promise<OrganizationSettings> => {
  const { data } = await axiosClient.put<ApiResponse<OrganizationSettings>>('/settings/organization', req)
  return data.data
}

export const getAttendancePolicy = async (): Promise<AttendancePolicySettings> => {
  const { data } = await axiosClient.get<ApiResponse<AttendancePolicySettings>>('/settings/attendance-policy')
  return data.data
}

export const updateAttendancePolicy = async (
  req: AttendancePolicySettings,
): Promise<AttendancePolicySettings> => {
  const { data } = await axiosClient.put<ApiResponse<AttendancePolicySettings>>('/settings/attendance-policy', req)
  return data.data
}
