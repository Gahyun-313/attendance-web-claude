import type { ReactNode } from 'react'

export interface TableColumn<T> {
  key: string
  header: string
  render?: (row: T) => ReactNode
}

interface TableProps<T> {
  columns: TableColumn<T>[]
  data: T[]
  rowKey: (row: T) => string | number
  emptyMessage?: string
}

function Table<T extends object>({ columns, data, rowKey, emptyMessage = '데이터가 없습니다.' }: TableProps<T>) {
  // 2026-07-23 정정: STEP4 땐 border gray-200/rounded-md였는데 STEP7 목업 기준(카드 토큰과 동일한
  // e8e9ec/12px radius/그림자, 헤더 행 bg #fafbfc)으로 교체 - 이제 Table 자체가 카드 프레임을 겸함
  return (
    <div className="w-full overflow-hidden rounded-xl border border-[#e8e9ec] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <table className="w-full text-left text-sm">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="border-b border-[#eceef1] bg-[#fafbfc] px-3.5 py-2.5 text-[11.5px] font-semibold text-[#8a8f98]"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
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
                  <td key={col.key} className="whitespace-nowrap px-3.5 py-2.5 text-[13px] text-[#1c1e21]">
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
