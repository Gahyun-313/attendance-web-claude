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

// 태그 수정 요청 - NfcTagUpdateRequest DTO (등록용과 별도 클래스로 존재한다고 §7에 나와있어 uid 필드
// 포함 여부가 불확실함. STEP16에서 사용자가 요청한 "UID 수정 가능"을 반영해 일단 같이 보내지만,
// 백엔드가 이 필드를 무시하거나 검증 에러(400)를 낼 수 있어 실제 테스트로 확인 필요)
export interface NfcTagUpdateRequest {
  uid: string
  name: string
  description?: string
  location: string
}
