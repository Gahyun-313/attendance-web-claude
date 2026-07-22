import type { ReactNode } from 'react'

export type BadgeStatus =
  | 'present' // 출석
  | 'late' // 지각
  | 'absent' // 결석
  | 'earlyLeave' // 조퇴 (Figma 시안에만 있고 백엔드 AttendanceStatus에는 없음 - 화면 작업 때 확인 필요)
  | 'waiting' // 대기
  | 'active' // 재학/활성
  | 'inactive' // 휴학/비활성
  | 'default'

interface BadgeProps {
  status?: BadgeStatus
  children: ReactNode
}

const statusClasses: Record<BadgeStatus, string> = {
  present: 'bg-green-50 text-green-700 border-green-200',
  late: 'bg-amber-50 text-amber-700 border-amber-200',
  absent: 'bg-red-50 text-red-700 border-red-200',
  earlyLeave: 'bg-gray-100 text-gray-600 border-gray-200',
  waiting: 'bg-blue-50 text-blue-700 border-blue-200',
  active: 'bg-green-50 text-green-700 border-green-200',
  inactive: 'bg-gray-100 text-gray-500 border-gray-200',
  default: 'bg-gray-100 text-gray-700 border-gray-200',
}

const Badge = ({ status = 'default', children }: BadgeProps) => {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusClasses[status]}`}
    >
      {children}
    </span>
  )
}

export default Badge
