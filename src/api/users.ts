// 사용자(학생 계정) 관리 API. attendance-project-context.md §9 "사용자 관리 API" 기준.
// GET /api/users는 "페이징" 지원이라고 명시돼있는데 정확한 페이지 파라미터/응답 포맷(배열 vs Page 래퍼)은
// 문서에 없어서, 실제 UI가 아직 페이지네이션을 안 쓰는 점을 감안해 size를 크게 줘서 사실상 전체를 한 번에 받고
// 응답이 배열이든 PageResponse든 둘 다 처리하도록 방어적으로 작성함 (TODO: 실제 응답 보고 정리)
import axiosClient from './axiosClient'
import type { ApiResponse, PageResponse } from '../types/common'
import type { CreateUserRequest, StudentAccount, UserUpdateRequest } from '../types/student'
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

export const listUsers = async (): Promise<StudentAccount[]> => {
  const { data } = await axiosClient.get<ApiResponse<PageResponse<UserResponseDto> | UserResponseDto[]>>('/users', {
    params: { size: 1000 },
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

// 사용자 삭제 = soft delete(비활성화) - §9에 명시된 대로 별도 "재활성화" API는 없음
export const deactivateUser = async (id: number): Promise<void> => {
  await axiosClient.delete(`/users/${id}`)
}
