// 2026-07-23(STEP19): attendance-project-context.md §8 NfcTag 엔티티 기준으로 실제 필드에 맞춤
// - 상태값은 실제로 ACTIVE/INACTIVE/LOST/DAMAGED 4종 (목업 기준으로 2종만 있던 걸 확장)
// - 엔티티엔 "연결된 세션" 필드가 없음 (세션 쪽이 nfcTag를 참조하는 단방향 관계) - `session`은 일단 유지하되
//   실제로는 서버가 내려주지 않을 수 있어 optional로 바꿔둠. 응답에 없으면 항상 null로 처리됨(TODO: 실제 응답 확인 후 필요시 제거)
export type NfcTagStatus = 'ACTIVE' | 'INACTIVE' | 'LOST' | 'DAMAGED'

export interface NfcTag {
  id: number
  name: string
  uid: string
  location: string
  description?: string | null
  session?: string | null
  lastUsed: string | null
  status: NfcTagStatus
}

// 신규 태그 등록 요청 - NfcTagRequest DTO
export interface NfcTagRequest {
  uid: string
  name: string
  description?: string
  location: string
}

// 태그 수정 요청 - NfcTagUpdateRequest DTO.
// 2026-07-24 api-specification.md로 실제 필드 확인됨: name, description, location만 받음 - uid는 없음
// (STEP16에서 "수정 화면에서 UID도 바꿀 수 있게" 요청받아 한때 uid를 같이 보냈었는데, 실제 백엔드는 이 값을
// 받지 않아 무시되고 있었음 - STEP21에서 되돌림. UID는 등록(NfcTagRequest) 시에만 지정 가능)
export interface NfcTagUpdateRequest {
  name: string
  description?: string
  location: string
}
