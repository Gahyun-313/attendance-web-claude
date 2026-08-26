// 출석 기록 API. attendance-project-context.md §9 "출석 기록 API" 기준.
// AttendanceResponse의 사용자 이름/학번/그룹명 필드는 2026-08-20 AttendanceResponse.java 소스로 확정됨
// (userName/studentId/groupName - 기존 추정이 전부 정확했음). null 가능성(예: 사용자 조회 실패)은 그대로
// optional 처리 + mapAttendance()에서 '-'로 대체하는 방어 로직 유지
import axiosClient from './axiosClient'
import type { ApiResponse, PageResponse } from '../types/common'
import type { AttendanceDashboardStats, AttendanceRecord, AttendanceStatus, AttendanceStatusUpdateRequest, RecentAttendance } from '../types/attendance'
import { unwrapListPayload } from '../utils/pageResponse'

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
  // NFC 태그 목록에서 Spring Data Page 래퍼로 오는 게 실제 확인돼서, 여기도 같은 방식일 수 있어 방어적으로 처리
  const { data } = await axiosClient.get<ApiResponse<PageResponse<AttendanceResponseDto> | AttendanceResponseDto[]>>(
    `/attendances/sessions/${sessionId}`,
    { params: { size: 1000 } },
  )
  return unwrapListPayload(data.data).map(mapAttendance)
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

// 대시보드 "최근 출석 기록" 표용 - 세션 구분 없이 단체 전체 최근 체크인 N건 (2026-08-26 백엔드 배포 완료
// 공지, STEP37에서 연동). limit은 서버가 1~50 clamp, 기본 10.
// 응답이 data 자체가 배열인지("사용자 목록조회"의 users(page)/"활성세션 조회"의 sessions[]처럼 이 문서 표기
// 관례상 유력) 아니면 { recentAttendances: [...] } 로 한 번 더 감싸져 오는지 명세에 명확히 안 나와있어서
// 방어적으로 둘 다 처리 (실제 응답 확인되면 이 방어 코드는 정리 가능)
export const getRecentAttendances = async (limit = 10): Promise<RecentAttendance[]> => {
  const { data } = await axiosClient.get<ApiResponse<RecentAttendance[] | { recentAttendances: RecentAttendance[] }>>(
    '/attendances/recent',
    { params: { limit } },
  )
  return Array.isArray(data.data) ? data.data : data.data.recentAttendances
}
