// 통계 화면. 2026-07-23(STEP19): 상단 통계 카드 4개 + 그룹별 출석률은 실제 통계 API(GET /api/statistics/overall,
// /dashboard)로 연동. "최근 완료 세션 평균"과 "출석률 상위/하위 사용자"는 이 두 엔드포인트만으론 채울 수 없는 데이터라
// (사용자별 전수 조회 API가 없어 상위/하위를 뽑으려면 전체 사용자 통계를 다 불러와야 하는데, 그런 목록형 API가 없음)
// 목업 시드 데이터를 그대로 남겨둠 - 실제로 필요해지면 백엔드에 전용 API 추가를 요청해야 함(TODO)
import { useQuery } from '@tanstack/react-query'
import { Card } from '../components'
import { getDashboardStatistics, getOverallStatistics } from '../api/statistics'

// TODO: 상위/하위 사용자 랭킹용 전용 API가 없어서 당분간 시드 데이터 유지 (§9엔 사용자 개별 조회만 있음)
const USER_RATES = [
  { name: '이서준', group: '개발1팀', rate: 96 },
  { name: '박지훈', group: '개발1팀', rate: 91 },
  { name: '김민준', group: '개발1팀', rate: 88 },
  { name: '최수아', group: '스터디 A조', rate: 100 },
  { name: '정예은', group: '스터디 B조', rate: 79 },
  { name: '강도현', group: '스터디 C조', rate: 62 },
  { name: '윤서아', group: 'CS스터디팀', rate: 94 },
  { name: '오하준', group: '개발1팀', rate: 85 },
]

// TODO: "최근 완료 세션 N회 평균" 전용 API가 없어서 당분간 시드 데이터 유지
const RECENT_SESSION_BARS = [
  { label: '1회', pct: 84, opacity: 0.8 },
  { label: '2회', pct: 88, opacity: 0.8 },
  { label: '3회', pct: 79, opacity: 0.8 },
  { label: '4회', pct: 91, opacity: 0.9 },
  { label: '5회', pct: 87, opacity: 0.8 },
  { label: '6회', pct: 93, opacity: 0.95 },
]

// 80% 미만이면 경고색 - 목업의 lowAttendanceAlert 기본값(true)을 그대로 상수로
const LOW_ATTENDANCE_ALERT = true
const isLow = (pct: number) => LOW_ATTENDANCE_ALERT && pct < 80

const topUsers = [...USER_RATES].sort((a, b) => b.rate - a.rate).slice(0, 3)
const bottomUsers = [...USER_RATES].sort((a, b) => a.rate - b.rate).slice(0, 3)

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

      {/* ===== UI: 그룹별 출석률(가로 바, 실제 API) + 최근 세션 평균(세로 바, 아직 시드 데이터) ===== */}
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

        {/* ----- UI: 최근 완료 세션 6회 평균 출석률 - CSS 세로 바 차트 (전용 API 없어서 여전히 시드 데이터) ----- */}
        <Card>
          <p className="text-sm font-bold text-[#1c1e21]">최근 완료 세션 평균 출석률</p>
          <p className="mb-4 text-xs text-[#8a8f98]">최근 6회차</p>
          <div className="flex h-[120px] items-end gap-3">
            {RECENT_SESSION_BARS.map((bar) => (
              <div key={bar.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                <div
                  className="w-full rounded-t"
                  style={{ height: `${bar.pct}%`, backgroundColor: `oklch(55% 0.16 258 / ${bar.opacity})` }}
                />
                <span className="text-[10.5px] text-[#9aa1ac]">{bar.label}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ===== UI: 출석률 상위/하위 사용자 리스트 (표 아니고 그냥 줄 목록, 전용 API 없어서 여전히 시드 데이터) ===== */}
      <div className="grid grid-cols-2 gap-4">
        {/* ----- UI: 상위 3명 ----- */}
        <Card>
          <p className="mb-3 text-sm font-bold text-[#1c1e21]">출석률 상위 사용자</p>
          <div>
            {topUsers.map((u) => (
              <div
                key={u.name}
                className="flex justify-between border-b border-[#f4f5f6] py-[7px] text-[13px] last:border-b-0"
              >
                <span>
                  {u.name} <span className="text-xs text-[#9aa1ac]">· {u.group}</span>
                </span>
                <b className="text-[#1c1e21]">{u.rate}%</b>
              </div>
            ))}
          </div>
        </Card>

        {/* ----- UI: 하위 3명 - 80% 미만이면 % 숫자가 경고색으로 바뀜 ----- */}
        <Card>
          <p className="mb-3 text-sm font-bold text-[#1c1e21]">출석률 하위 사용자</p>
          <div>
            {bottomUsers.map((u) => (
              <div
                key={u.name}
                className="flex justify-between border-b border-[#f4f5f6] py-[7px] text-[13px] last:border-b-0"
              >
                <span>
                  {u.name} <span className="text-xs text-[#9aa1ac]">· {u.group}</span>
                </span>
                <b style={{ color: isLow(u.rate) ? 'oklch(48% 0.18 20)' : '#1c1e21' }}>{u.rate}%</b>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}

export default StatisticsPage
