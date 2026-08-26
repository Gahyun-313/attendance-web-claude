// 대시보드(홈) 화면. 오늘 하루의 세션/출석 현황을 통계 카드 + 차트 + 표로 요약해서 보여준다.
// 2026-07-25: 목업(Claude Design)의 시드 데이터를 전부 제거함(사용자 요청 - "프론트에서 임의로 만든 mock
// 데이터 삭제"). 2026-08-20(STEP30): DashboardStatisticsResponse.java 소스로 확정된 GET /api/statistics/dashboard로
// 통계 카드 4개 중 "오늘 세션 수"/"진행 중인 세션" 2개만 연동함.
// 2026-08-26(STEP36): "오늘 출석률"(당시엔 recentAttendanceRate로 임시 대체)/"진행 중인 세션" 목록 연동.
// 2026-08-26(STEP37): 백엔드가 API 배포 완료(사용자 공지) - "오늘 출석률"을 진짜 todayAttendanceRate로
// 교체(STEP36의 recentAttendanceRate 임시 대체 해소), "활성 사용자"는 GET /api/users/dashboard의 activateUsers로
// 채움(UsersPage.tsx가 STEP25부터 이미 쓰던 기존 API를 재사용한 것 - 신규 API 아니었음), "최근 출석 기록" 표는
// 신규 GET /api/attendances/recent로 채움. 시간대별 추이/오늘 상태분포 차트 2개는 여전히 대응 필드의 정확한
// JSON 구조가 명세에 없어서(추측하면 STEP30 groupRates류 버그 재발 위험) 이번엔 보류 -
// DashboardStatisticsResponse.java/HourlyCheckInCount.java 실 소스 확인되면 다음 STEP에서 채움
import { useQuery } from '@tanstack/react-query'
import { Badge, Card, Table } from '../components'
import type { TableColumn } from '../components'
import { getDashboardStatistics } from '../api/statistics'
import { listSessions } from '../api/sessions'
import { getUserDashboard } from '../api/users'
import { getRecentAttendances } from '../api/attendances'
import { sessionStatusMeta, attendanceStatusMeta } from '../utils/badgeColors'
import type { RecentAttendance } from '../types/attendance'

const recentChecksColumns: TableColumn<RecentAttendance>[] = [
  { key: 'name', header: '이름', render: (row) => row.userName },
  { key: 'session', header: '세션', render: (row) => row.sessionTitle },
  { key: 'time', header: '시간', render: (row) => row.checkInTime },
  {
    key: 'status',
    header: '상태',
    render: (row) => {
      const meta = attendanceStatusMeta[row.status]
      return <Badge color={meta.color}>{meta.label}</Badge>
    },
  },
]

const DashboardPage = () => {
  // StatisticsPage와 같은 queryKey('statisticsDashboard')를 써서 두 화면을 오갈 때 캐시를 공유함
  const dashboardQuery = useQuery({ queryKey: ['statisticsDashboard'], queryFn: getDashboardStatistics })
  const dashboard = dashboardQuery.data

  // "진행 중인 세션" 카드용 - SessionsPage와 같은 listSessions()를 상태 필터만 걸어서 재사용
  const activeSessionsQuery = useQuery({
    queryKey: ['sessions', 'dashboardActive'],
    queryFn: () => listSessions({ status: 'ACTIVE' }),
  })
  const activeSessions = activeSessionsQuery.data ?? []

  // "활성 사용자" 카드용 - UsersPage.tsx가 이미 쓰던 것과 동일한 GET /api/users/dashboard 재사용 (STEP37)
  const userDashboardQuery = useQuery({ queryKey: ['userDashboard'], queryFn: getUserDashboard })
  const userDashboard = userDashboardQuery.data

  // "최근 출석 기록" 표용 - 세션 무관 전체 최근 체크인 (STEP37)
  const recentAttendancesQuery = useQuery({ queryKey: ['attendances', 'recent'], queryFn: () => getRecentAttendances(10) })
  const recentAttendances = recentAttendancesQuery.data ?? []

  return (
    <>
      {/* ===== UI: 통계 카드 4개 - 4개 전부 실 데이터 (STEP37) ===== */}
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
          <p className="mt-1 text-[26px] font-bold text-[#1c1e21]">
            {dashboard ? `${Math.round(dashboard.todayAttendanceRate)}%` : '-'}
          </p>
        </Card>
        <Card>
          <p className="text-[12.5px] font-medium text-[#8a8f98]">활성 사용자</p>
          <p className="mt-1 text-[26px] font-bold text-[#1c1e21]">
            {userDashboard ? `${userDashboard.activateUsers}명` : '-'}
          </p>
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

      {/* ===== UI: 진행 중인 세션 카드 + 최근 출석 기록 표 - 둘 다 실 데이터 ===== */}
      <div className="grid grid-cols-[1fr_1.3fr] gap-4">
        <Card title="진행 중인 세션">
          {activeSessions.length === 0 ? (
            <p className="text-xs text-[#9aa1ac]">
              {activeSessionsQuery.isLoading ? '불러오는 중...' : '진행 중인 세션이 없습니다.'}
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {activeSessions.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-[#1c1e21]">{s.name}</p>
                    <p className="truncate text-xs text-[#9aa1ac]">
                      {s.group} · {s.time}
                    </p>
                  </div>
                  <Badge color={sessionStatusMeta[s.status].color}>{sessionStatusMeta[s.status].label}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div>
          <p className="mb-3 text-sm font-bold text-[#1c1e21]">최근 출석 기록</p>
          <Table
            columns={recentChecksColumns}
            data={recentAttendances}
            rowKey={(row) => row.id}
            emptyMessage={recentAttendancesQuery.isLoading ? '불러오는 중...' : '데이터가 없습니다.'}
          />
        </div>
      </div>
    </>
  )
}

export default DashboardPage
