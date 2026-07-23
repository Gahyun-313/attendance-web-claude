// TODO: 백엔드 세션 API(GET/POST /api/sessions 등) 붙일 때 실제 응답 기준으로 재검증 필요
// 지금은 Claude Design 목업(Admin Web Page Mockups)의 세션 데이터 구조를 그대로 옮김
export type SessionStatus = 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELED'

export interface Session {
  id: number
  name: string
  group: string
  date: string
  time: string
  tag: string
  rate: string
  status: SessionStatus
  desc: string
  location: string
  lateThreshold: string
  note: string
}
