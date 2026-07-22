import { Badge, Card, Table } from '../components'
import { attendanceStatusMeta } from '../utils/badgeColors'
import type { TableColumn } from '../components'

// TODO: 지금은 Claude Design 목업(Admin Web Page Mockups)의 시드 데이터를 그대로 씀.
// 실제 연동은 GET /api/statistics/dashboard, GET /api/attendances/... 붙일 때(다음 STEP) 교체
interface StatCard {
  label: string
  value: string
  valueClassName?: string
}

const STAT_CARDS: StatCard[] = [
  { label: '오늘 세션 수', value: '3건' },
  { label: '진행 중인 세션', value: '1건', valueClassName: 'text-[oklch(42%_0.13_152)]' },
  { label: '오늘 출석률', value: '82%' },
  { label: '활성 사용자', value: '39명' },
]

interface HourlyBar {
  hour: string
  pct: number
  peak?: boolean
}

// 09시~21시, 목업 시드 그대로
const HOURLY_BARS: HourlyBar[] = [
  { hour: '09', pct: 15 },
  { hour: '10', pct: 8 },
  { hour: '11', pct: 5 },
  { hour: '12', pct: 10 },
  { hour: '13', pct: 20 },
  { hour: '14', pct: 85, peak: true },
  { hour: '15', pct: 40 },
  { hour: '16', pct: 12 },
  { hour: '17', pct: 25 },
  { hour: '18', pct: 35 },
  { hour: '19', pct: 78, peak: true },
  { hour: '20', pct: 55 },
  { hour: '21', pct: 18 },
]

const STATUS_DISTRIBUTION = [
  { label: '출석', pct: 68, color: 'oklch(55% 0.14 152)' },
  { label: '지각', pct: 17, color: 'oklch(68% 0.15 70)' },
  { label: '결석', pct: 15, color: 'oklch(58% 0.19 18)' },
]

const LIVE_SESSION = {
  name: '백엔드 프로젝트 주간회의',
  group: '개발1팀',
  location: 'NFC-회의실2',
  time: '10:00~11:00',
  checkedIn: 3,
  total: 8,
}

interface RecentCheck {
  name: string
  session: string
  time: string
  status: keyof typeof attendanceStatusMeta
}

const RECENT_CHECKS: RecentCheck[] = [
  { name: '이서준', session: '백엔드 프로젝트 주간회의', time: '10:02', status: 'PRESENT' },
  { name: '박지훈', session: '백엔드 프로젝트 주간회의', time: '10:12', status: 'LATE' },
  { name: '김민준', session: '백엔드 프로젝트 주간회의', time: '09:58', status: 'PRESENT' },
  { name: '윤서아', session: '백엔드 프로젝트 주간회의', time: '10:00', status: 'PRESENT' },
  { name: '이하윤', session: '알고리즘 스터디 8회차', time: '19:04(전일)', status: 'PRESENT' },
]

const recentChecksColumns: TableColumn<RecentCheck>[] = [
  { key: 'name', header: '이름' },
  { key: 'session', header: '세션' },
  { key: 'time', header: '시간' },
  {
    key: 'status',
    header: '상태',
    render: (row) => {
      const meta = attendanceStatusMeta[row.status]
      return <Badge color={meta.color}>{meta.label}</Badge>
    },
  },
]

// conic-gradient 도넛 - 출석/지각/결석 순으로 누적 퍼센트 지점을 이어붙임
const donutStops = (() => {
  let acc = 0
  return STATUS_DISTRIBUTION.map((s) => {
    const from = acc
    acc += s.pct
    return `${s.color} ${from}% ${acc}%`
  }).join(', ')
})()

const DashboardPage = () => {
  return (
    <>
      {/* 통계 카드 4개 */}
      <div className="grid grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => (
          <Card key={card.label}>
            <p className="text-[12.5px] font-medium text-[#8a8f98]">{card.label}</p>
            <p className={`mt-1 text-[26px] font-bold ${card.valueClassName ?? 'text-[#1c1e21]'}`}>{card.value}</p>
          </Card>
        ))}
      </div>

      {/* 시간대별 추이 + 상태 분포 */}
      <div className="grid grid-cols-[1.5fr_1fr] gap-4">
        <Card>
          <p className="text-sm font-bold text-[#1c1e21]">시간대별 출석 체크 추이</p>
          <p className="mb-4 text-xs text-[#9aa1ac]">오늘, 09시~21시</p>
          <div className="flex h-[120px] items-end gap-1.5">
            {HOURLY_BARS.map((bar) => (
              <div key={bar.hour} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className="w-full rounded-t"
                  style={{
                    height: `${bar.pct}%`,
                    backgroundColor: `oklch(55% 0.16 258 / ${bar.peak ? 0.9 : 0.85})`,
                  }}
                />
                <span className="text-[10.5px] text-[#9aa1ac]">{bar.hour}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="mb-4 text-sm font-bold text-[#1c1e21]">오늘 출석 상태 분포</p>
          <div className="flex items-center justify-center">
            <div
              className="relative flex size-[110px] items-center justify-center rounded-full"
              style={{ background: `conic-gradient(${donutStops})` }}
            >
              <div className="flex size-[70px] items-center justify-center rounded-full bg-white text-[17px] font-bold text-[#1c1e21]">
                82%
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-center gap-4">
            {STATUS_DISTRIBUTION.map((s) => (
              <div key={s.label} className="flex items-center gap-1.5 text-xs text-[#6b7280]">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                {s.label} {s.pct}%
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 진행 중인 세션 + 최근 출석 기록 */}
      <div className="grid grid-cols-[1fr_1.3fr] gap-4">
        <Card title="진행 중인 세션">
          <div className="rounded-[10px] border border-[#eceef1] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#1c1e21]">{LIVE_SESSION.name}</p>
                <p className="mt-1 text-xs text-[#9aa1ac]">
                  {LIVE_SESSION.group} · {LIVE_SESSION.location} · {LIVE_SESSION.time}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-xs font-medium text-[oklch(42%_0.13_152)]">
                <span className="size-2 animate-[livePulse_1.6s_infinite] rounded-full bg-[#22c55e]" />
                진행중 · {LIVE_SESSION.checkedIn}/{LIVE_SESSION.total}명
              </div>
            </div>
          </div>
        </Card>

        <Card title="최근 출석 기록">
          <Table columns={recentChecksColumns} data={RECENT_CHECKS} rowKey={(row) => `${row.name}-${row.time}`} />
        </Card>
      </div>
    </>
  )
}

export default DashboardPage
