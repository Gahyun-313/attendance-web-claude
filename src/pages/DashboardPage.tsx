// 대시보드(홈) 화면. 오늘 하루의 세션/출석 현황을 통계 카드 + 차트 + 표로 요약해서 보여준다.
// 2026-07-25: 목업(Claude Design)의 시드 데이터를 전부 제거함(사용자 요청 - "프론트에서 임의로 만든 mock
// 데이터 삭제"). 대응하는 백엔드 API(GET /api/statistics/dashboard 등)가 아직 없어서, 레이아웃은 그대로 두고
// 전부 빈 상태(placeholder)로만 표시. 실제 API가 준비되면 각 섹션에 useQuery로 채워 넣으면 됨
import { Card, Table } from '../components'
import type { TableColumn } from '../components'

// 최근 출석 기록 표 - 실 데이터 없이 컬럼 정의만 유지 (emptyMessage로 빈 상태 표시)
interface RecentCheck {
  name: string
  session: string
  time: string
  status: string
}

const recentChecksColumns: TableColumn<RecentCheck>[] = [
  { key: 'name', header: '이름' },
  { key: 'session', header: '세션' },
  { key: 'time', header: '시간' },
  { key: 'status', header: '상태' },
]

const STAT_LABELS = ['오늘 세션 수', '진행 중인 세션', '오늘 출석률', '활성 사용자']

const DashboardPage = () => {
  return (
    <>
      {/* ===== UI: 통계 카드 4개 - 대응 API가 없어서 전부 '-' ===== */}
      <div className="grid grid-cols-4 gap-4">
        {STAT_LABELS.map((label) => (
          <Card key={label}>
            <p className="text-[12.5px] font-medium text-[#8a8f98]">{label}</p>
            <p className="mt-1 text-[26px] font-bold text-[#1c1e21]">-</p>
          </Card>
        ))}
      </div>

      {/* ===== UI: 시간대별 바 차트 + 상태 분포 도넛 차트 - 데이터 없어서 빈 상태 문구만 표시 ===== */}
      <div className="grid grid-cols-[1.5fr_1fr] gap-4">
        <Card>
          <p className="text-sm font-bold text-[#1c1e21]">시간대별 출석 체크 추이</p>
          <p className="mb-4 text-xs text-[#9aa1ac]">오늘, 09시~21시</p>
          <div className="flex h-[120px] items-center justify-center text-xs text-[#9aa1ac]">데이터가 없습니다</div>
        </Card>

        <Card>
          <p className="mb-4 text-sm font-bold text-[#1c1e21]">오늘 출석 상태 분포</p>
          <div className="flex h-[110px] items-center justify-center text-xs text-[#9aa1ac]">데이터가 없습니다</div>
        </Card>
      </div>

      {/* ===== UI: 진행 중인 세션 카드 + 최근 출석 기록 표 - 데이터 없어서 빈 상태 문구만 표시 ===== */}
      <div className="grid grid-cols-[1fr_1.3fr] gap-4">
        <Card title="진행 중인 세션">
          <p className="text-xs text-[#9aa1ac]">진행 중인 세션이 없습니다.</p>
        </Card>

        <div>
          <p className="mb-3 text-sm font-bold text-[#1c1e21]">최근 출석 기록</p>
          <Table
            columns={recentChecksColumns}
            data={[] as RecentCheck[]}
            rowKey={(row) => `${row.name}-${row.time}`}
            emptyMessage="데이터가 없습니다."
          />
        </div>
      </div>
    </>
  )
}

export default DashboardPage
