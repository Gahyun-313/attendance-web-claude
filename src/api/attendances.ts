// 출석 기록 API. attendance-project-context.md §9 "출석 기록 API" 기준.
// AttendanceResponse가 사용자 이름/학번/그룹명을 어떤 키로 채워 내려주는지는 문서에 없어서
// 응답에 없는 필드는 optional로 받고 mapAttendance()에서 '-'로 대체 - 실제 응답 확인되면 여기만 고치면 됨
import axiosClient from './axiosClient'
import type { ApiResponse } from '../types/common'
import type { AttendanceDashboardStats, AttendanceRecord, AttendanceStatus, AttendanceStatusUpdateRequest } from '../types/attendance'

interface AttendanceResponseDto {
  id: number
  userId: number
  userName?: string | null
  studentId?: string | null
  groupName?: string | null
  status: AttendanceStatus
  checkInTime?: string | null
  nfcLocation?: string | null
  modifiedBy?: string | null
  note?: string | null
}

const mapAttendance = (dto: AttendanceResponseDto): AttendanceRecord => ({
  id: dto.id,
  userId: dto.userId,
  name: dto.userName ?? `사용자 #${dto.userId}`,
  sid: dto.studentId ?? '-',
  group: dto.groupName ?? '-',
  status: dto.status,
  time: dto.checkInTime ?? '-',
  location: dto.nfcLocation ?? '-',
  modifier: dto.modifiedBy ?? '-',
  note: dto.note ?? '-',
})

export const listAttendancesBySession = async (sessionId: number): Promise<AttendanceRecord[]> => {
  const { data } = await axiosClient.get<ApiResponse<AttendanceResponseDto[]>>(`/attendances/sessions/${sessionId}`)
  return data.data.map(mapAttendance)
}

export const updateAttendanceStatus = async (
  attendanceId: number,
  req: AttendanceStatusUpdateRequest,
): Promise<AttendanceRecord> => {
  const { data } = await axiosClient.put<ApiResponse<AttendanceResponseDto>>(`/attendances/${attendanceId}/status`, req)
  return mapAttendance(data.data)
}

export const getAttendanceDashboard = async (sessionId: number): Promise<AttendanceDashboardStats> => {
  const { data } = await axiosClient.get<ApiResponse<AttendanceDashboardStats>>(
    `/attendances/sessions/${sessionId}/dashboard`,
  )
  return data.data
}
