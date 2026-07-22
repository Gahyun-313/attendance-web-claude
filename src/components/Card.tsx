import type { ReactNode } from 'react'

interface CardProps {
  title?: string
  children: ReactNode
  className?: string
}

const Card = ({ title, children, className = '' }: CardProps) => {
  return (
    <div className={`rounded-md border border-gray-200 bg-gray-50 p-[13px] ${className}`}>
      {title && <p className="mb-3 text-base font-semibold text-gray-800">{title}</p>}
      {children}
    </div>
  )
}

export default Card
