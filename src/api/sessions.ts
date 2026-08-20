// 출석 세션 API. attendance-project-context.md §9 "출석 세션 API" 기준.
// 서버 응답(SessionResponse)의 JSON 필드명은 2026-08-20 SessionResponse.java 소스로 확정됨. mapSession()
// 한 곳에서만 서버 응답 -> 화면이 쓰는 Session 뷰 모델로 변환한다 (필드명이 나중에 또 바뀌면 이 함수만 고치면 됨)
import axiosClient from './axiosClient'
import type { ApiResponse, PageResponse } from '../types/common'
import type { Session, SessionRequest, SessionStatus } from '../types/session'
import { unwrapListPayload } from '../utils/pageResponse'

// 백엔드 SessionResponse (2026-08-20 소스로 확정). NFC 태그는 nfcTagId/nfcTagName 평면 필드가 아니라
// nfcTag 중첩 객체(연결 안 됐으면 null)로 내려옴 - 예전엔 평면 필드로 잘못 추정해서 항상 '-'로만 보였던 버그였음
interface SessionResponseDto {
  id: number
  title: string
  description: string
  groupName: string
  sessionDate: string
  startTime: string
  endTime: string
  lateThresholdMinutes: number
  location: string
  status: SessionStatus
  nfcTag: { id: number; uid: string; name: string; location: string } | null
  note: string
}

const mapSession = (dto: SessionResponseDto): Session => ({
  id: dto.id,
  name: dto.title,
  group: dto.groupName,
  date: dto.sessionDate,
  time: `${dto.startTime}–${dto.endTime}`,
  tag: dto.nfcTag?.name ?? '-',
  rate: '-', // 목록 API엔 출석률이 없음 (TODO: 상세에서 출석 대시보드 API로 보강)
  status: dto.status,
  desc: dto.description,
  location: dto.location,
  lateThreshold: `시작 후 ${dto.lateThresholdMinutes}분`,
  note: dto.note,
  nfcTagId: dto.nfcTag?.id ?? null,
})

export interface ListSessionsParams {
  status?: SessionStatus
  // 2026-08-05: api-specification.md(#8 수정본)로 파라미터명이 실제로 keyword가 맞다고 확정됨 (더 이상 추정 아님)
  keyword?: string
}

export const listSessions = async (params: ListSessionsParams = {}): Promise<Session[]> => {
  // NFC 태그 목록에서 Spring Data Page 래퍼(content/pageable 등)로 오는 게 실제 확인돼서, 세션도 같은 방식일 수 있어 방어적으로 처리
  const { data } = await axiosClient.get<ApiResponse<PageResponse<SessionResponseDto> | SessionResponseDto[]>>(
    '/sessions',
    { params: { size: 1000, status: params.status, keyword: params.keyword } },
  )
  return unwrapListPayload(data.data).map(mapSession)
}

export const createSession = async (req: SessionRequest): Promise<Session> => {
  const { data } = await axiosClient.post<ApiResponse<SessionResponseDto>>('/sessions', req)
  return mapSession(data.data)
}

export const updateSession = async (id: number, req: SessionRequest): Promise<Session> => {
  const { data } = await axiosClient.put<ApiResponse<SessionResponseDto>>(`/sessions/${id}`, req)
  return mapSession(data.data)
}

export const deleteSession = async (id: number): Promise<void> => {
  await axiosClient.delete(`/sessions/${id}`)
}

export const startSession = async (id: number): Promise<Session> => {
  const { data } = await axiosClient.post<ApiResponse<SessionResponseDto>>(`/sessions/${id}/start`)
  return mapSession(data.data)
}

export const closeSession = async (id: number): Promise<Session> => {
  const { data } = await axiosClient.post<ApiResponse<SessionResponseDto>>(`/sessions/${id}/close`)
  return mapSession(data.data)
}

export const cancelSession = async (id: number): Promise<Session> => {
  const { data } = await axiosClient.post<ApiResponse<SessionResponseDto>>(`/sessions/${id}/cancel`)
  return mapSession(data.data)
}
