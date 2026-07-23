import { Card } from '../components'

// TODO: 지금은 Claude Design 목업(Admin Web Page Mockups)의 통계 화면 시드 데이터를 그대로 씀.
// 실제 연동은 통계 API(GET /api/statistics/... 등) 붙일 때(다음 STEP) 교체.
// 상위/하위 사용자 목록은 목업처럼 사용자 관리 화면의 usersRaw를 정렬해서 뽑는 방식이라
// 여기서도 같은 시드(이름/그룹/누적출석률)를 별도로 갖고 있음 - 실 연동 때는 통계 API 응답으로 대체
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

const GROUP_RATES = [
  { name: '개발1팀', pct: 94 },
  { name: '스터디 A조', pct: 91 },
  { name: '스터디 B조', pct: 85 },
  { name: '스터디 C조', pct: 78 },
  { name: 'CS스터디팀', pct: 89 },
]

// 최근 완료 세션 6회 평균 출석률 - 목업도 배열 바인딩 없이 하드코딩된 정적 차트라 그대로 둠
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
  return (
    <>
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <p className="text-xs font-medium text-[#8a8f98]">총 학생 수</p>
          <p className="mt-1 text-[22px] font-bold text-[#1c1e21]">42명</p>
        </Card>
        <Card>
          <p className="text-xs font-medium text-[#8a8f98]">총 세션 수</p>
          <p className="mt-1 text-[22px] font-bold text-[#1c1e21]">128회</p>
        </Card>
        <Card>
          <p className="text-xs font-medium text-[#8a8f98]">전체 출석률</p>
          <p className="mt-1 text-[22px] font-bold text-[#1c1e21]">87.4%</p>
        </Card>
        <Card>
          <p className="text-xs font-medium text-[#8a8f98]">상태별 누적</p>
          <p className="mt-[6px] text-[12.5px] text-[#6b7280]">출석 892 · 지각 154 · 결석 98</p>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <p className="mb-4 text-sm font-bold text-[#1c1e21]">그룹별 출석률</p>
          <div className="flex flex-col gap-3">
            {GROUP_RATES.map((g) => {
              const low = isLow(g.pct)
              return (
                <div key={g.name} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-[12.5px] text-[#4b5563]">{g.name}</span>
                  <div className="h-[9px] flex-1 overflow-hidden rounded-[5px] bg-[#eef0f3]">
                    <div
                      className="h-full rounded-[5px]"
                      style={{
                        width: `${g.pct}%`,
                        backgroundColor: low ? 'oklch(58% 0.19 18)' : 'oklch(55% 0.16 258)',
                      }}
                    />
                  </div>
                  <span
                    className="w-[38px] text-right text-[12.5px] font-semibold"
                    style={{ color: low ? 'oklch(48% 0.18 20)' : '#1c1e21' }}
                  >
                    {g.pct}%
                  </span>
                </div>
              )
            })}
          </div>
        </Card>

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

      <div className="grid grid-cols-2 gap-4">
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
