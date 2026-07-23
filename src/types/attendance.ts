// TODO: 백엔드 출석 API(GET /api/attendances 등) 붙일 때 실제 응답 기준으로 재검증 필요
// 지금은 Claude Design 목업(Admin Web Page Mockups)의 출석 현황 데이터 구조를 그대로 옮김
export type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT' | 'WAITING'

export interface AttendanceRecord {
  id: number
  name: string
  sid: string
  group: string
  status: AttendanceStatus
  time: string
  location: string
  modifier: string
  note: string
}
