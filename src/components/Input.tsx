import type { InputHTMLAttributes, ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode
  /** true면 왼쪽에 돋보기 아이콘이 붙는 검색창 스타일 */
  search?: boolean
}

const Input = ({ label, search = false, className = '', ...props }: InputProps) => {
  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && <label className="flex items-center gap-1.5 text-[12.5px] font-semibold text-gray-800">{label}</label>}
      <div className="relative">
        {search && (
          <svg
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400"
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
          className={`h-[38px] w-full rounded border border-gray-300 bg-white text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-800 ${search ? 'pl-9 pr-3' : 'px-3'} ${className}`}
          {...props}
        />
      </div>
    </div>
  )
}

export default Input
