// TODO: 백엔드 NFC 태그 API(GET /api/nfc-tags 등) 붙일 때 실제 응답 기준으로 재검증 필요
// 지금은 Claude Design 목업(Admin Web Page Mockups)의 NFC 태그 관리 데이터 구조를 그대로 옮김
export type NfcTagStatus = 'ACTIVE' | 'INACTIVE'

export interface NfcTag {
  id: number
  name: string
  uid: string
  location: string
  session: string | null
  lastUsed: string | null
  status: NfcTagStatus
}
