import type { InputHTMLAttributes, ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode
  /** true면 왼쪽에 돋보기 아이콘이 붙는 검색창 스타일 */
  search?: boolean
}

// 2026-07-23 정정: STEP4 땐 Figma 톤(gray-300 border, gray-800 focus ring)이었는데
// STEP9(사용자 관리 폼) 작업하면서 목업의 실제 폼 필드 토큰(#dcdfe4 border, rounded-lg, 블루 포커스)으로 교체
const Input = ({ label, search = false, className = '', ...props }: InputProps) => {
  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && <label className="flex items-center gap-1.5 text-[12.5px] font-semibold text-[#4b5563]">{label}</label>}
      <div className="relative">
        {search && (
          <svg
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9aa1ac]"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="9" cy="9" r="6" />
            <path d="m14 14 4 4" strokeLinecap="round" />
          </svg>
        )}
        <input
          className={`h-[38px] w-full rounded-lg border border-[#dcdfe4] bg-white text-[13px] text-[#1c1e21] placeholder:text-[#9aa1ac] focus:outline-none focus:ring-1 focus:ring-[oklch(55%_0.16_258)] ${search ? 'pl-9 pr-3' : 'px-3'} ${className}`}
          {...props}
        />
      </div>
    </div>
  )
}

export default Input
