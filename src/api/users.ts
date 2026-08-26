// 사용자(학생 계정) 관리 API. attendance-project-context.md §9 "사용자 관리 API" 기준.
// GET /api/users는 "페이징" 지원이라고 명시돼있는데 정확한 페이지 파라미터/응답 포맷(배열 vs Page 래퍼)은
// 문서에 없어서, 실제 UI가 아직 페이지네이션을 안 쓰는 점을 감안해 size를 크게 줘서 사실상 전체를 한 번에 받고
// 응답이 배열이든 PageResponse든 둘 다 처리하도록 방어적으로 작성함 (TODO: 실제 응답 보고 정리)
// §12 결정사항: UserRepository.searchStudents가 groupName/keyword 선택 필터를 지원한다고 명시돼있어
// 서버사이드로 실제 전달함 (활성/비활성은 문서에 파라미터가 없어서 화면에서 계속 클라이언트 필터링)
import axiosClient from './axiosClient'
import type { ApiResponse, PageResponse } from '../types/common'
import type { CreateUserRequest, StudentAccount, UserUpdateRequest } from '../types/student'
import type { PasswordChangeRequest } from '../types/user'
import { unwrapListPayload } from '../utils/pageResponse'

interface UserResponseDto {
  id: number
  username: string // = 학번(studentId)
  name: string
  email: string
  groupName: string
  firstAttendanceAt: string | null
  active: boolean
}

const mapUser = (dto: UserResponseDto): StudentAccount => ({
  id: dto.id,
  name: dto.name,
  email: dto.email,
  studentId: dto.username,
  group: dto.groupName,
  firstDate: dto.firstAttendanceAt,
  rate: 0, // User 엔티티엔 없는 값 - api/statistics.ts의 getUserStatistics로 화면에서 별도로 채움
  lateCount: 0,
  absentCount: 0,
  active: dto.active,
})

export interface ListUsersParams {
  groupName?: string
  keyword?: string
}

export const listUsers = async (params: ListUsersParams = {}): Promise<StudentAccount[]> => {
  const { data } = await axiosClient.get<ApiResponse<PageResponse<UserResponseDto> | UserResponseDto[]>>('/users', {
    params: { size: 1000, groupName: params.groupName, keyword: params.keyword },
  })
  return unwrapListPayload(data.data).map(mapUser)
}

export const listUserGroups = async (): Promise<string[]> => {
  const { data } = await axiosClient.get<ApiResponse<string[]>>('/users/groups')
  return data.data
}

export const createUser = async (req: CreateUserRequest): Promise<StudentAccount> => {
  const { data } = await axiosClient.post<ApiResponse<UserResponseDto>>('/users', {
    username: req.studentId,
    password: req.password,
    name: req.name,
    groupName: req.groupName,
    note: req.note,
  })
  return mapUser(data.data)
}

export const updateUser = async (id: number, req: UserUpdateRequest): Promise<StudentAccount> => {
  const { data } = await axiosClient.put<ApiResponse<UserResponseDto>>(`/users/${id}`, req)
  return mapUser(data.data)
}

// 사용자 삭제 = soft delete(비활성화)
export const deactivateUser = async (id: number): Promise<void> => {
  await axiosClient.delete(`/users/${id}`)
}

// 재활성화 (2026-08-18 BE 신규 API 공지로 확인됨 - 예전엔 없었음). 응답은 UserResponse 전체를 내려주지만
// mapUser가 쓰는 필드만 골라 쓰므로 UserResponseDto/mapUser를 그대로 재사용
export const activateUser = async (id: number): Promise<StudentAccount> => {
  const { data } = await axiosClient.post<ApiResponse<UserResponseDto>>(`/users/${id}/activate`)
  return mapUser(data.data)
}

// 사용자 관리 화면 상단 요약 통계 (2026-08-18 BE 신규 API 공지로 확인됨 - 예전엔 MSW mock이었음).
// 2026-08-26(STEP37): 대시보드 화면 "활성 사용자" 카드도 이 API를 그대로 재사용함(신규 API 아니었음 - 처음엔
// 신규로 착각해서 getUserDashboard를 중복 선언할 뻔함, UsersPage.tsx에서 이미 쓰고 있던 걸 뒤늦게 확인).
// activateUsers는 오타 아님 - 실제 API 필드명 그대로
export interface UserDashboardSummary {
  totalUsers: number
  activateUsers: number
  averageAttendanceRate: number
  newUsersThisMonth: number
}

export const getUserDashboard = async (): Promise<UserDashboardSummary> => {
  const { data } = await axiosClient.get<ApiResponse<UserDashboardSummary>>('/users/dashboard')
  return data.data
}

// 로그인된 관리자 본인 비밀번호 변경 (2026-08-20 api-specification.md #8 수정본으로 확정: PATCH /users/me/password,
// userId 불필요 - 본인 전용). 응답 바디 없음
export const changePassword = async (req: PasswordChangeRequest): Promise<void> => {
  await axiosClient.patch('/users/me/password', req)
}
