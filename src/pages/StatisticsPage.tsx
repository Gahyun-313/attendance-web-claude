// 통계 화면. 2026-07-23(STEP19): 상단 통계 카드 4개 + 그룹별 출석률은 실제 통계 API(GET /api/statistics/overall,
// /dashboard)로 연동. "최근 완료 세션 평균"과 "출석률 상위/하위 사용자"는 이 두 엔드포인트만으론 채울 수 없는 데이터라
// (사용자별 전수 조회 API가 없어 상위/하위를 뽑으려면 전체 사용자 통계를 다 불러와야 하는데, 그런 목록형 API가 없음)
// 2026-07-25: 이 두 섹션에 남아있던 목업 시드 데이터를 제거함(사용자 요청) - 지금은 빈 상태로만 표시.
// 필요해지면 백엔드에 전용 API 추가를 요청해야 함(TODO)
import { useQuery } from '@tanstack/react-query'
import { Card } from '../components'
import { getDashboardStatistics, getOverallStatistics } from '../api/statistics'

// 80% 미만이면 경고색 - 목업의 lowAttendanceAlert 기본값(true)을 그대로 상수로 (그룹별 출석률 섹션에서 실 데이터에 사용)
const LOW_ATTENDANCE_ALERT = true
const isLow = (pct: number) => LOW_ATTENDANCE_ALERT && pct < 80

const StatisticsPage = () => {
  const overallQuery = useQuery({ queryKey: ['statisticsOverall'], queryFn: getOverallStatistics })
  const dashboardQuery = useQuery({ queryKey: ['statisticsDashboard'], queryFn: getDashboardStatistics })
  const overall = overallQuery.data
  const groupRates = dashboardQuery.data?.groupRates ?? []

  return (
    <>
      {/* ===== UI: 통계 카드 4개 - GET /api/statistics/overall 값 (로딩 전엔 '-') ===== */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <p className="text-xs font-medium text-[#8a8f98]">총 학생 수</p>
          <p className="mt-1 text-[22px] font-bold text-[#1c1e21]">{overall ? `${overall.totalUsers}명` : '-'}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium text-[#8a8f98]">총 세션 수</p>
          <p className="mt-1 text-[22px] font-bold text-[#1c1e21]">{overall ? `${overall.totalSessions}회` : '-'}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium text-[#8a8f98]">전체 출석률</p>
          <p className="mt-1 text-[22px] font-bold text-[#1c1e21]">
            {overall ? `${overall.overallAttendanceRate.toFixed(1)}%` : '-'}
          </p>
        </Card>
        <Card>
          <p className="text-xs font-medium text-[#8a8f98]">상태별 누적</p>
          <p className="mt-[6px] text-[12.5px] text-[#6b7280]">
            {overall
              ? `출석 ${overall.presentCount} · 지각 ${overall.lateCount} · 결석 ${overall.absentCount}`
              : '불러오는 중...'}
          </p>
        </Card>
      </div>

      {/* ===== UI: 그룹별 출석률(가로 바, 실제 API) + 최근 세션 평균(세로 바, 대응 API 없어서 빈 상태) ===== */}
      <div className="grid grid-cols-2 gap-4">
        {/* ----- UI: 그룹별 출석률 - 80% 미만이면 바/글자색이 경고색(oklch 빨강)으로 바뀜 (isLow) ----- */}
        <Card>
          <p className="mb-4 text-sm font-bold text-[#1c1e21]">그룹별 출석률</p>
          <div className="flex flex-col gap-3">
            {groupRates.length === 0 && <p className="text-xs text-[#9aa1ac]">불러오는 중...</p>}
            {groupRates.map((g) => {
              const low = isLow(g.attendanceRate)
              return (
                <div key={g.groupName} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-[12.5px] text-[#4b5563]">{g.groupName}</span>
                  <div className="h-[9px] flex-1 overflow-hidden rounded-[5px] bg-[#eef0f3]">
                    <div
                      className="h-full rounded-[5px]"
                      style={{
                        width: `${g.attendanceRate}%`,
                        backgroundColor: low ? 'oklch(58% 0.19 18)' : 'oklch(55% 0.16 258)',
                      }}
                    />
                  </div>
                  <span
                    className="w-[38px] text-right text-[12.5px] font-semibold"
                    style={{ color: low ? 'oklch(48% 0.18 20)' : '#1c1e21' }}
                  >
                    {Math.round(g.attendanceRate)}%
                  </span>
                </div>
              )
            })}
          </div>
        </Card>

        {/* ----- UI: 최근 완료 세션 평균 출석률 - 전용 API가 없어서 빈 상태 ----- */}
        <Card>
          <p className="text-sm font-bold text-[#1c1e21]">최근 완료 세션 평균 출석률</p>
          <p className="mb-4 text-xs text-[#8a8f98]">최근 6회차</p>
          <div className="flex h-[120px] items-center justify-center text-xs text-[#9aa1ac]">데이터가 없습니다</div>
        </Card>
      </div>

      {/* ===== UI: 출석률 상위/하위 사용자 리스트 - 전용 API가 없어서 빈 상태 ===== */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <p className="mb-3 text-sm font-bold text-[#1c1e21]">출석률 상위 사용자</p>
          <p className="py-2 text-xs text-[#9aa1ac]">데이터가 없습니다.</p>
        </Card>

        <Card>
          <p className="mb-3 text-sm font-bold text-[#1c1e21]">출석률 하위 사용자</p>
          <p className="py-2 text-xs text-[#9aa1ac]">데이터가 없습니다.</p>
        </Card>
      </div>
    </>
  )
}

export default StatisticsPage
