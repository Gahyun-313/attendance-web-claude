import type { BadgeColor } from '../components/Badge'
import type { SessionStatus } from '../types/session'
import type { AttendanceStatus } from '../types/attendance'

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
