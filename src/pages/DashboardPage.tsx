// 대시보드(홈) 화면. 오늘 하루의 세션/출석 현황을 통계 카드 + 차트 + 표로 요약해서 보여준다.
// 2026-07-25: 목업(Claude Design)의 시드 데이터를 전부 제거함(사용자 요청 - "프론트에서 임의로 만든 mock
// 데이터 삭제"). 2026-08-20(STEP30): DashboardStatisticsResponse.java 소스로 확정된 GET /api/statistics/dashboard로
// 통계 카드 4개 중 "오늘 세션 수"/"진행 중인 세션" 2개만 연동함 - "오늘 출석률"/"활성 사용자"는 이 DTO에 대응
// 필드가 아예 없어서(activeUserCount는 애초에 존재하지 않는 추정이었음) 계속 '-'로 남겨둠. 차트/진행중세션/최근출석
// 표는 여전히 대응 API가 없어서 빈 상태 유지
import { useQuery } from '@tanstack/react-query'
import { Card, Table } from '../components'
import type { TableColumn } from '../components'
import { getDashboardStatistics } from '../api/statistics'

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

const DashboardPage = () => {
  // StatisticsPage와 같은 queryKey('statisticsDashboard')를 써서 두 화면을 오갈 때 캐시를 공유함
  const dashboardQuery = useQuery({ queryKey: ['statisticsDashboard'], queryFn: getDashboardStatistics })
  const dashboard = dashboardQuery.data

  return (
    <>
      {/* ===== UI: 통계 카드 4개 - 앞 2개만 GET /api/statistics/dashboard 실 데이터, 뒤 2개는 대응 API가 없어서 '-' ===== */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <p className="text-[12.5px] font-medium text-[#8a8f98]">오늘 세션 수</p>
          <p className="mt-1 text-[26px] font-bold text-[#1c1e21]">{dashboard ? `${dashboard.todaySessionCount}건` : '-'}</p>
        </Card>
        <Card>
          <p className="text-[12.5px] font-medium text-[#8a8f98]">진행 중인 세션</p>
          <p className="mt-1 text-[26px] font-bold text-[#1c1e21]">{dashboard ? `${dashboard.activeSessionCount}건` : '-'}</p>
        </Card>
        <Card>
          <p className="text-[12.5px] font-medium text-[#8a8f98]">오늘 출석률</p>
          <p className="mt-1 text-[26px] font-bold text-[#1c1e21]">-</p>
        </Card>
        <Card>
          <p className="text-[12.5px] font-medium text-[#8a8f98]">활성 사용자</p>
          <p className="mt-1 text-[26px] font-bold text-[#1c1e21]">-</p>
        </Card>
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
