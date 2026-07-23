interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

// TODO: STEP4 때 만들고 아직 실제 화면에서 한 번도 안 씀 - 그래서 STEP6~7에서 정리한
// oklch 블루 색상 시스템(gray-800 → primary blue)이 반영 안 된 상태 그대로임.
// 나중에 실제 API로 목록이 많아져서 페이지네이션이 필요해지면, 쓰기 전에 색상부터 다른 컴포넌트들과 맞춰야 함
const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div className="flex items-center gap-2">
      {/* ===== UI: 페이지 번호 버튼들 (현재 페이지만 색 채워짐) ===== */}
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`flex size-8 items-center justify-center rounded-full text-sm ${
            page === currentPage ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {page}
        </button>
      ))}
      {/* ===== UI: 다음 버튼 (마지막 페이지면 비활성화) ===== */}
      <button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-800 disabled:opacity-40"
      >
        다음
      </button>
    </div>
  )
}

export default Pagination
