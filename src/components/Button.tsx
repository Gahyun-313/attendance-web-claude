import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'chip'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  active?: boolean // chip 변형에서 선택된 상태 표시용
  children: ReactNode
}

// Figma 기준 색상: 버튼은 파란색이 아니라 진한 회색(gray-800) 사용 (로그인 화면만 예외로 파란색)
const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-gray-800 text-white hover:bg-gray-700',
  secondary: 'bg-white text-gray-800 border border-gray-800 hover:bg-gray-50',
  ghost: 'text-gray-500 underline hover:text-gray-700',
  chip: 'bg-gray-100 text-gray-800 border border-gray-200 rounded-full hover:bg-gray-200',
}

const Button = ({ variant = 'primary', active = false, className = '', children, ...props }: ButtonProps) => {
  const base =
    variant === 'ghost'
      ? 'text-sm'
      : variant === 'chip'
        ? 'text-sm px-3 py-1.5 min-w-[40px]'
        : 'text-sm font-medium px-4 py-2 rounded-md min-w-[60px]'
  const activeClass = variant === 'chip' && active ? 'bg-gray-800 text-white border-gray-800' : ''

  return (
    <button className={`${base} ${activeClass || variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

export default Button
