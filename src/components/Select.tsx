import type { ReactNode, SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  placeholder?: string
  children: ReactNode
}

// Figma 시안은 커스텀 드롭다운(chevron 아이콘)이지만, 포트폴리오 관리자 화면 수준에서는
// 네이티브 <select>로 충분하다고 판단해 직접 만들지 않음 (과설계 방지)
const Select = ({ label, placeholder = 'Select...', className = '', children, ...props }: SelectProps) => {
  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && <label className="text-[12.5px] font-semibold text-gray-800">{label}</label>}
      <select
        defaultValue=""
        className={`h-[38px] w-full rounded border border-gray-300 bg-white px-3 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-800 ${className}`}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {children}
      </select>
    </div>
  )
}

export default Select
