import type { ReactNode } from 'react'

export interface TableColumn<T> {
  key: string
  header: string
  render?: (row: T) => ReactNode
  /** table-layout:fixed일 때 이 컬럼 너비 고정 (예: '90px'). 안 주면 남는 공간을 나눠 가짐 */
  width?: string
}

interface TableProps<T> {
  columns: TableColumn<T>[]
  data: T[]
  rowKey: (row: T) => string | number
  emptyMessage?: string
  /**
   * true면 컬럼 너비를 헤더 기준으로 고정(table-layout:fixed). 기본 테이블 레이아웃(auto)은
   * 브라우저가 "현재 보이는 행들"의 내용 길이를 보고 매번 컬럼 폭을 다시 계산하기 때문에,
   * 필터링으로 행이 바뀌면 셀 안쪽 여백이 달라 보이는 문제가 있음 - 필터/토글이 있는 표는 true로 써서 방지
   */
  fixedLayout?: boolean
}

function Table<T extends object>({
  columns,
  data,
  rowKey,
  emptyMessage = '데이터가 없습니다.',
  fixedLayout = false,
}: TableProps<T>) {
  // 2026-07-23 정정: STEP4 땐 border gray-200/rounded-md였는데 STEP7 목업 기준(카드 토큰과 동일한
  // e8e9ec/12px radius/그림자, 헤더 행 bg #fafbfc)으로 교체 - 이제 Table 자체가 카드 프레임을 겸함
  const cellWrapClass = fixedLayout ? 'break-words' : 'whitespace-nowrap'

  return (
    // ===== UI: 카드 프레임 (테두리/radius/그림자 - 이제 Table 자체가 카드 역할까지 함) =====
    <div className="w-full overflow-hidden rounded-xl border border-[#e8e9ec] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <table className={`w-full text-left text-sm ${fixedLayout ? 'table-fixed' : ''}`}>
        {/* ===== UI: 헤더 행 (배경 #fafbfc, 글자색 #8a8f98) ===== */}
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={col.width ? { width: col.width } : undefined}
                className="border-b border-[#eceef1] bg-[#fafbfc] px-3.5 py-2.5 text-[11.5px] font-semibold text-[#8a8f98]"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        {/* ===== UI: 본문 행 (비어있으면 emptyMessage, 아니면 columns.render로 셀 채움) ===== */}
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-3.5 py-8 text-center text-gray-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={rowKey(row)} className="border-b border-[#f1f2f4] last:border-b-0">
                {columns.map((col) => (
                  <td key={col.key} className={`${cellWrapClass} px-3.5 py-2.5 text-[13px] text-[#1c1e21]`}>
                    {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Table
