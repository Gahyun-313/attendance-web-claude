import type { BadgeColor } from '../components/Badge'
import type { SessionStatus } from '../types/session'
import type { AttendanceStatus } from '../types/attendance'
import type { NfcTagStatus } from '../types/nfcTag'
import type { NotificationStatus } from '../types/notification'

// 출석 상태: 백엔드 AttendanceStatus(PRESENT/LATE/ABSENT/WAITING) 기준
// - Figma 시안엔 "조퇴"가 있었는데 이 목업/백엔드 어디에도 없어서 최종적으로 뺌
export const attendanceStatusMeta: Record<AttendanceStatus, { color: BadgeColor; label: string }> = {
  PRESENT: { color: 'green', label: '출석' },
  LATE: { color: 'amber', label: '지각' },
  ABSENT: { color: 'red', label: '결석' },
  WAITING: { color: 'gray', label: '대기' },
}

// 세션 상태: Claude Design 목업의 badge('session', status) 매핑 그대로
export const sessionStatusMeta: Record<SessionStatus, { color: BadgeColor; label: string }> = {
  SCHEDULED: { color: 'blue', label: '예정' },
  ACTIVE: { color: 'green', label: '진행중' },
  COMPLETED: { color: 'gray', label: '종료' },
  CANCELED: { color: 'red', label: '취소' },
}

// 사용자(학생 계정) 활성 여부: badge('user', String(active)) 매핑 그대로 - boolean이라 Record 대신 함수로
export const userStatusMeta = (active: boolean): { color: BadgeColor; label: string } =>
  active ? { color: 'green', label: '활성' } : { color: 'gray', label: '비활성' }

// NFC 태그 상태: badge('nfc', status) 매핑 그대로 (ACTIVE/INACTIVE 2가지뿐 - "분실" 등은 이 목업엔 없음)
export const nfcTagStatusMeta: Record<NfcTagStatus, { color: BadgeColor; label: string }> = {
  ACTIVE: { color: 'green', label: '활성' },
  INACTIVE: { color: 'gray', label: '비활성' },
}

// 알림 상태: badge('notif', status) 매핑 그대로 - 세션 취소(빨강)와 다르게 알림 취소는 회색
export const notificationStatusMeta: Record<NotificationStatus, { color: BadgeColor; label: string }> = {
  SCHEDULED: { color: 'blue', label: '예약' },
  SENT: { color: 'green', label: '발송완료' },
  FAILED: { color: 'red', label: '실패' },
  CANCELED: { color: 'gray', label: '취소' },
}
