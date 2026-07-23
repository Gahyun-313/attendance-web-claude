// 통계 API. attendance-project-context.md §9 "통계 API" 기준.
// DTO 필드명은 클래스 이름만 확인됐고 필드 단위 상세는 문서에 없어서 §3 화면 정의 기준으로 추정해서 매핑함 -
// 실제 응답을 보고 다르면 이 파일의 인터페이스/매핑만 고치면 됨
import axiosClient from './axiosClient'
import type { ApiResponse } from '../types/common'
import type { DashboardStatistics, GroupAttendanceRate, OverallStatistics } from '../types/statistics'

export const getOverallStatistics = async (): Promise<OverallStatistics> => {
  const { data } = await axiosClient.get<ApiResponse<OverallStatistics>>('/statistics/overall')
  return data.data
}

export const getDashboardStatistics = async (): Promise<DashboardStatistics> => {
  const { data } = await axiosClient.get<ApiResponse<DashboardStatistics>>('/statistics/dashboard')
  return data.data
}

export interface UserStatistics {
  attendanceRate: number
  lateCount: number
  absentCount: number
}

// 사용자 관리 화면 목록에서 행마다 호출 - User 엔티티엔 출석률/지각/결석 수가 없어서 이 API로 따로 채움(사용자 확인된 방식)
export const getUserStatistics = async (userId: number): Promise<UserStatistics> => {
  const { data } = await axiosClient.get<ApiResponse<UserStatistics>>(`/statistics/users/${userId}`)
  return data.data
}

export type { GroupAttendanceRate }
