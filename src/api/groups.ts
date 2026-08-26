// 그룹(Group) 마스터 API. api-specification.md §9 기준 (2026-08-25 BE 신규 - GET/POST/PUT/DELETE 4종 전부 구현됨).
// GET /api/users/groups(사용 중인 그룹명만 distinct 조회하는 기존 API)와는 다른 API - 이쪽은 "등록된" 마스터
// 목록이고, 세션/사용자 생성·수정 시 groupName 유효성 검증 기준(G001)이 되는 쪽도 바로 이 마스터다
import axiosClient from './axiosClient'
import type { ApiResponse } from '../types/common'
import type { Group, GroupRequest } from '../types/group'

export const listGroups = async (): Promise<Group[]> => {
  const { data } = await axiosClient.get<ApiResponse<Group[]>>('/groups')
  return data.data
}

export const createGroup = async (req: GroupRequest): Promise<Group> => {
  const { data } = await axiosClient.post<ApiResponse<Group>>('/groups', req)
  return data.data
}

export const updateGroup = async (id: number, req: GroupRequest): Promise<Group> => {
  const { data } = await axiosClient.put<ApiResponse<Group>>(`/groups/${id}`, req)
  return data.data
}

export const deleteGroup = async (id: number): Promise<void> => {
  await axiosClient.delete(`/groups/${id}`)
}
