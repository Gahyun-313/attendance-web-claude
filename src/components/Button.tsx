import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'chip' | 'brand'
type ButtonSize = 'md' | 'sm'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize // sm = 테이블 행 안의 "상세"/"수정" 같은 인라인 액션 버튼용 (STEP7 세션관리 목업 기준)
  active?: boolean // chip 변형에서 선택된 상태 표시용
  children: ReactNode
}

// ===== UI: variant별 색상 (버튼 색만 바꾸고 싶으면 여기 값만 수정하면 됨) =====
// 2026-07-23 정정: 초기 Figma 프레임만 보고 gray-800을 primary로 잡았었는데,
// 이후 Claude Design 목업(Admin Web Page Mockups)이 훨씬 상세해서 그 기준(oklch 블루)으로 교체함
// brand는 로그인 화면 히어로 톤 전용(Tailwind blue-600, 목업과 무관한 예외)
const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-[oklch(55%_0.16_258)] text-white hover:opacity-90',
  secondary: 'bg-white text-[#4b5563] border border-[#dcdfe4] hover:bg-gray-50',
  ghost: 'text-gray-500 underline hover:text-gray-700',
  chip: 'bg-white text-[#8a8f98] border border-[#e8e9ec] rounded-full hover:bg-gray-50',
  brand: 'bg-blue-600 text-white hover:bg-blue-700',
}

const Button = ({ variant = 'primary', size = 'md', active = false, className = '', children, ...props }: ButtonProps) => {
  // ===== UI: 크기(size)별 padding/폰트 - 버튼 크기 바꾸고 싶으면 여기 =====
  const base =
    variant === 'ghost'
      ? 'text-sm'
      : variant === 'chip'
        ? 'text-sm px-3 py-1.5 min-w-[40px]'
        : size === 'sm'
          ? 'text-[11.5px] font-medium px-[9px] py-1 rounded-md'
          : 'text-sm font-medium px-4 py-2 rounded-md min-w-[60px]'
  const activeClass =
    variant === 'chip' && active
      ? 'bg-[oklch(95%_0.03_258)] text-[oklch(46%_0.16_258)] font-semibold border-transparent'
      : ''

  // ===== UI: 실제 렌더링 =====
  return (
    <button className={`${base} ${activeClass || variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

export default Button
