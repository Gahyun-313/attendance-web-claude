// TODO: 백엔드 알림 API(GET/POST /api/notifications 등) 붙일 때 실제 응답 기준으로 재검증 필요
// 지금은 Claude Design 목업(Admin Web Page Mockups)의 알림 관리 데이터 구조를 그대로 옮김
export type NotificationStatus = 'SCHEDULED' | 'SENT' | 'FAILED' | 'CANCELED'

export interface NotificationItem {
  id: number
  title: string
  target: string
  method: string
  when: string
  status: NotificationStatus
}
