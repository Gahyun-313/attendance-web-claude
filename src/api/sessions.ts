// 출석 세션 API. attendance-project-context.md §9 "출석 세션 API" 기준.
// 서버 응답(SessionResponse)의 정확한 JSON 필드명은 문서에 없어서, 여기 mapSession() 한 곳에서만
// 서버 응답 -> 화면이 쓰는 Session 뷰 모델로 변환한다. 실제 응답을 보고 필드명이 다르면 이 함수만 고치면 됨
import axiosClient from './axiosClient'
import type { ApiResponse, PageResponse } from '../types/common'
import type { Session, SessionRequest, SessionStatus } from '../types/session'
import { unwrapListPayload } from '../utils/pageResponse'

// 백엔드 SessionResponse 추정 형태 (엔티티 §8 기준)
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
  note: string
  nfcTagId?: number | null
  nfcTagName?: string | null // TODO: 실제 필드명 미확인 (nfcTag 객체로 내려올 수도 있음)
}

const mapSession = (dto: SessionResponseDto): Session => ({
  id: dto.id,
  name: dto.title,
  group: dto.groupName,
  date: dto.sessionDate,
  time: `${dto.startTime}–${dto.endTime}`,
  tag: dto.nfcTagName ?? '-',
  rate: '-', // 목록 API엔 출석률이 없음 (TODO: 상세에서 출석 대시보드 API로 보강)
  status: dto.status,
  desc: dto.description,
  location: dto.location,
  lateThreshold: `시작 후 ${dto.lateThresholdMinutes}분`,
  note: dto.note,
  nfcTagId: dto.nfcTagId ?? null,
})

export const listSessions = async (): Promise<Session[]> => {
  // NFC 태그 목록에서 Spring Data Page 래퍼(content/pageable 등)로 오는 게 실제 확인돼서, 세션도 같은 방식일 수 있어 방어적으로 처리
  const { data } = await axiosClient.get<ApiResponse<PageResponse<SessionResponseDto> | SessionResponseDto[]>>(
    '/sessions',
    { params: { size: 1000 } },
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
