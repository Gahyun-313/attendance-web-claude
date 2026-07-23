// NFC 태그 API. attendance-project-context.md §9 "NFC 태그 API" 기준.
import axiosClient from './axiosClient'
import type { ApiResponse, PageResponse } from '../types/common'
import type { NfcTag, NfcTagRequest, NfcTagStatus, NfcTagUpdateRequest } from '../types/nfcTag'
import { unwrapListPayload } from '../utils/pageResponse'

// 백엔드 NfcTagResponse 추정 형태 (엔티티 §8 기준 - "연결된 세션" 필드는 엔티티에 없어서 항상 undefined로 옴)
interface NfcTagResponseDto {
  id: number
  uid: string
  name: string
  description?: string | null
  location: string
  status: NfcTagStatus
  lastUsedAt: string | null
}

const mapNfcTag = (dto: NfcTagResponseDto): NfcTag => ({
  id: dto.id,
  name: dto.name,
  uid: dto.uid,
  location: dto.location,
  description: dto.description ?? null,
  session: null, // TODO: 엔티티에 없는 필드 - 필요하면 활성 세션 목록과 nfcTagId로 교차 조회해서 채워야 함
  lastUsed: dto.lastUsedAt,
  status: dto.status,
})

export const listNfcTags = async (): Promise<NfcTag[]> => {
  // 2026-07-23 실제 응답 확인됨: content/pageable 등을 포함한 Spring Data Page 형태로 옴 (배열 아님)
  const { data } = await axiosClient.get<ApiResponse<PageResponse<NfcTagResponseDto> | NfcTagResponseDto[]>>(
    '/nfc-tags',
    { params: { size: 1000 } },
  )
  return unwrapListPayload(data.data).map(mapNfcTag)
}

export const createNfcTag = async (req: NfcTagRequest): Promise<NfcTag> => {
  const { data } = await axiosClient.post<ApiResponse<NfcTagResponseDto>>('/nfc-tags', req)
  return mapNfcTag(data.data)
}

export const updateNfcTag = async (id: number, req: NfcTagUpdateRequest): Promise<NfcTag> => {
  const { data } = await axiosClient.put<ApiResponse<NfcTagResponseDto>>(`/nfc-tags/${id}`, req)
  return mapNfcTag(data.data)
}

export const activateNfcTag = async (id: number): Promise<NfcTag> => {
  const { data } = await axiosClient.post<ApiResponse<NfcTagResponseDto>>(`/nfc-tags/${id}/activate`)
  return mapNfcTag(data.data)
}

export const deactivateNfcTag = async (id: number): Promise<NfcTag> => {
  const { data } = await axiosClient.post<ApiResponse<NfcTagResponseDto>>(`/nfc-tags/${id}/deactivate`)
  return mapNfcTag(data.data)
}

export const deleteNfcTag = async (id: number): Promise<void> => {
  await axiosClient.delete(`/nfc-tags/${id}`)
}
