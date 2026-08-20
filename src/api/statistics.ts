// 통계 API. attendance-project-context.md §9 "통계 API" 기준.
// 2026-08-20: overall/dashboard 응답 DTO 필드명은 OverallStatisticsResponse/DashboardStatisticsResponse.java
// 소스로 확정됨(types/statistics.ts 주석 참고 - dashboard 쪽은 groupRates→groupAttendanceRates 등 버그 수정 있었음)
import axiosClient from './axiosClient'
import type { ApiResponse } from '../types/common'
import type { AttendanceRanking, DashboardStatistics, GroupAttendanceRate, OverallStatistics } from '../types/statistics'

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

// 출석률 상위/하위 랭킹 (2026-08-18 BE 신규 API 공지로 확인됨 - 예전엔 대응 API가 없어서 빈 상태였음).
// limit은 1~50으로 서버가 자동 clamp, 기본 5. 1분 TTL 캐싱이라 화면에서 너무 자주 refetch할 필요 없음
export const getAttendanceRanking = async (limit = 5): Promise<AttendanceRanking> => {
  const { data } = await axiosClient.get<ApiResponse<AttendanceRanking>>('/statistics/ranking', {
    params: { limit },
  })
  return data.data
}

export type { GroupAttendanceRate }
