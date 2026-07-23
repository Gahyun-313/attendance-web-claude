import type { MouseEvent, ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
}

// 2026-07-23 정정: STEP4 땐 모달 시안이 없어서 카드 톤(rounded-xl, gray-200)으로 임의 구성했는데,
// STEP7에서 Claude Design 목업의 세션 상세 모달을 보니 실제 토큰(overlay/그림자/radius)이 나와있어서 그 기준으로 교체
const Modal = ({ open, onClose, title, children, footer }: ModalProps) => {
  if (!open) return null

  const stopPropagation = (e: MouseEvent) => e.stopPropagation()

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,17,21,0.45)]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-[460px] rounded-[14px] bg-white p-[26px_28px] shadow-[0_20px_60px_rgba(16,24,40,0.25)]"
        onClick={stopPropagation}
      >
        {title && (
          <div className="mb-4 flex items-start justify-between">
            <h2 className="text-base font-bold text-[#1c1e21]">{title}</h2>
            <button onClick={onClose} className="p-0.5 text-xl leading-none text-[#9aa1ac] hover:text-gray-600" aria-label="닫기">
              ×
            </button>
          </div>
        )}
        <div>{children}</div>
        {footer && <div className="mt-[22px] flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  )
}

export default Modal
