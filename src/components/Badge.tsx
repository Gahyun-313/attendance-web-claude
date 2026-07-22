import type { ReactNode } from 'react'

// 색상은 Claude Design 목업(Admin Web Page Mockups)의 badge(kind, key) 매핑을 그대로 옮김
// 상태 문자열(PRESENT/LATE 등)마다 색이 도메인별로 다를 수 있어서(예: 알림 취소=회색, 세션 취소=빨강)
// Badge 자체는 색만 알고, 어떤 상태가 어떤 색인지는 화면/유틸 쪽에서 결정한다
export type BadgeColor = 'green' | 'amber' | 'red' | 'gray' | 'blue'

interface BadgeProps {
  color?: BadgeColor
  children: ReactNode
}

const colorClasses: Record<BadgeColor, string> = {
  green: 'bg-[oklch(95%_0.05_152)] text-[oklch(42%_0.13_152)]',
  amber: 'bg-[oklch(95%_0.06_75)] text-[oklch(50%_0.14_75)]',
  red: 'bg-[oklch(95%_0.045_20)] text-[oklch(48%_0.18_20)]',
  gray: 'bg-[#f1f2f4] text-[#6b7280]',
  blue: 'bg-[oklch(95%_0.03_258)] text-[oklch(46%_0.16_258)]',
}

const Badge = ({ color = 'gray', children }: BadgeProps) => {
  return (
    <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium ${colorClasses[color]}`}>
      {children}
    </span>
  )
}

export default Badge
