import type { BadgeColor } from '../components/Badge'

// 출석 상태: 백엔드 AttendanceStatus(PRESENT/LATE/ABSENT/WAITING) 기준
// - Figma 시안엔 "조퇴"가 있었는데 이 목업/백엔드 어디에도 없어서 최종적으로 뺌
export const attendanceStatusMeta: Record<
  'PRESENT' | 'LATE' | 'ABSENT' | 'WAITING',
  { color: BadgeColor; label: string }
> = {
  PRESENT: { color: 'green', label: '출석' },
  LATE: { color: 'amber', label: '지각' },
  ABSENT: { color: 'red', label: '결석' },
  WAITING: { color: 'gray', label: '대기' },
}
