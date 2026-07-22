import type { ReactNode } from 'react'

type CardTone = 'elevated' | 'subtle'

interface CardProps {
  title?: string
  /** elevated(기본): 흰 배경+옅은 그림자, Claude Design 목업의 통계/차트 카드 스타일
   *  subtle: 연회색 배경, 필터 그룹핑 박스 등에 사용 */
  tone?: CardTone
  children: ReactNode
  className?: string
}

const toneClasses: Record<CardTone, string> = {
  elevated: 'border border-[#e8e9ec] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]',
  subtle: 'border border-gray-200 bg-gray-50',
}

const Card = ({ title, tone = 'elevated', children, className = '' }: CardProps) => {
  return (
    <div className={`rounded-xl p-5 ${toneClasses[tone]} ${className}`}>
      {title && <p className="mb-3 text-sm font-bold text-[#1c1e21]">{title}</p>}
      {children}
    </div>
  )
}

export default Card
