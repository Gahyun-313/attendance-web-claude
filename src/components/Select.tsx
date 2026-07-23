import type { ReactNode, SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  placeholder?: string
  children: ReactNode
}

// Figma 시안은 커스텀 드롭다운(chevron 아이콘)이지만, 포트폴리오 관리자 화면 수준에서는
// 네이티브 <select>로 충분하다고 판단해 직접 만들지 않음 (과설계 방지)
// 2026-07-23 정정: 색/radius/포커스 링을 Input과 동일하게 목업 토큰(#dcdfe4, rounded-lg, 블루)으로 교체
// 2026-07-23(STEP9): value로 완전히 controlled하게 쓸 때(사용자 관리 폼의 그룹 select 등)는
// 빈 placeholder 옵션을 끼워넣지 않도록 분기 - 안 그러면 defaultValue=""랑 value가 같이 박혀서
// React가 경고를 뱉고, 목업에도 이런 select엔 빈 옵션이 없음
const Select = ({ label, placeholder = 'Select...', className = '', children, value, ...props }: SelectProps) => {
  const isControlled = value !== undefined

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && <label className="text-[12.5px] font-semibold text-[#4b5563]">{label}</label>}
      <select
        {...(isControlled ? { value } : { defaultValue: '' })}
        className={`h-[38px] w-full rounded-lg border border-[#dcdfe4] bg-white px-3 text-[13px] text-[#1c1e21] focus:outline-none focus:ring-1 focus:ring-[oklch(55%_0.16_258)] ${className}`}
        {...props}
      >
        {!isControlled && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children}
      </select>
    </div>
  )
}

export default Select
