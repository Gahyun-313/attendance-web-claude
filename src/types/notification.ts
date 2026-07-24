// 2026-07-23(STEP19): attendance-project-context.md §8 Notification 엔티티 기준으로 실제 필드에 맞춤
// - 목업엔 있던 "발송 방식"(푸시/이메일) 필드는 실제 백엔드에 없어서 제거함 (사용자 확인 완료) -
//   dispatch()는 FCM 토큰 존재 여부만 보고 SENT/FAILED를 결정하고, 이메일 발송 로직 자체가 없음
export type NotificationStatus = 'SCHEDULED' | 'SENT' | 'FAILED' | 'CANCELED'

export interface NotificationItem {
  id: number
  title: string
  content: string
  targetGroup: string | null // null = 전체 발송
  status: NotificationStatus
  scheduledAt: string | null
  sentAt: string | null
  targetCount: number | null
}

// 알림 발송 방식 - 2026-07-24 사용자 확인: 실제 요청에 sendType 필드가 있음(누락돼있었음).
// 정확한 값 목록은 미확인이라, scheduledAt 채움 여부로 그대로 대응된다고 보고 IMMEDIATE/SCHEDULED로 추정해서 보냄
// (TODO: 실제 응답/서버 코드로 정확한 값 확인 필요 - 400 나면 여기부터 의심)
export type NotificationSendType = 'IMMEDIATE' | 'SCHEDULED'

// 새 알림 생성 요청 - NotificationRequest DTO. scheduledAt이 없거나 과거면 즉시 발송 시도(§9)
export interface NotificationRequest {
  title: string
  content: string
  targetGroup: string | null
  sendType: NotificationSendType
  scheduledAt: string | null
}
