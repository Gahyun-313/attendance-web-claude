interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

// 2026-07-23(STEP4)에 만들고 아직 실제 화면에서 안 씀 - 지금 목록 화면들은 백엔드에 size:1000으로
// 사실상 전체 조회를 요청해서 페이지네이션 UI 자체가 필요 없는 상태 (STEP19~20 참고).
// 2026-07-25: 실제로 쓰이기 전이지만, 다른 공통 컴포넌트들과 색상이 어긋나 있던 걸(gray-800 primary) STEP6~7 기준
// oklch 블루 색상 시스템으로 맞춰둠 - 나중에 목록이 많아져 실제로 페이지네이션을 붙일 때 그대로 쓸 수 있게
const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div className="flex items-center gap-2">
      {/* ===== UI: 페이지 번호 버튼들 (현재 페이지만 primary 블루로 채워짐) ===== */}
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`flex size-8 items-center justify-center rounded-full text-sm ${
            page === currentPage
              ? 'bg-[oklch(55%_0.16_258)] text-white'
              : 'bg-[#f1f2f4] text-[#4b5563] hover:bg-[#e8e9ec]'
          }`}
        >
          {page}
        </button>
      ))}
      {/* ===== UI: 다음 버튼 (마지막 페이지면 비활성화) ===== */}
      <button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="rounded-md border border-[#dcdfe4] px-3 py-1.5 text-sm text-[#4b5563] hover:bg-gray-50 disabled:opacity-40"
      >
        다음
      </button>
    </div>
  )
}

export default Pagination
