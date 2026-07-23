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

// 새 알림 생성 요청 - NotificationRequest DTO. scheduledAt이 없거나 과거면 즉시 발송 시도(§9)
export interface NotificationRequest {
  title: string
  content: string
  targetGroup: string | null
  scheduledAt: string | null
}
