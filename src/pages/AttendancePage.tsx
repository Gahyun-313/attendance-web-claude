import { useMemo, useState } from 'react'
import { Badge, Button, Card, Table } from '../components'
import type { TableColumn } from '../components'
import { attendanceStatusMeta } from '../utils/badgeColors'
import type { AttendanceRecord, AttendanceStatus } from '../types/attendance'

// TODO: 지금은 Claude Design 목업(Admin Web Page Mockups)의 출석 현황 화면 시드 데이터를 그대로 씀.
// 실제 연동은 GET /api/attendances 등 출석 API 붙일 때(다음 STEP) 교체.
// 목업이 세션 1개(백엔드 프로젝트 주간회의) 기준 데이터만 갖고 있어서 날짜/세션 select는 지금은
// 옵션이 하나뿐인 정적 값 - 실제로는 세션 목록 API로 채워야 함
const ATTENDANCE_RECORDS: AttendanceRecord[] = [
  { id: 1, name: '이서준', sid: '20231234', group: '개발1팀', status: 'PRESENT', time: '10:02', location: 'NFC-회의실2', modifier: '-', note: '-' },
  { id: 2, name: '박지훈', sid: '20231235', group: '개발1팀', status: 'LATE', time: '10:12', location: 'NFC-회의실2', modifier: '-', note: '-' },
  { id: 3, name: '김민준', sid: '20231236', group: '개발1팀', status: 'PRESENT', time: '09:58', location: 'NFC-회의실2', modifier: '-', note: '-' },
  { id: 4, name: '최수아', sid: '20231237', group: '개발1팀', status: 'WAITING', time: '-', location: '-', modifier: '-', note: '-' },
  { id: 5, name: '정예은', sid: '20231238', group: '개발1팀', status: 'WAITING', time: '-', location: '-', modifier: '-', note: '-' },
  { id: 6, name: '강도현', sid: '20231239', group: '개발1팀', status: 'ABSENT', time: '-', location: '-', modifier: '김도윤(관리자)', note: '사전 결석 통보' },
  { id: 7, name: '윤서아', sid: '20231240', group: '개발1팀', status: 'PRESENT', time: '10:00', location: 'NFC-회의실2', modifier: '-', note: '-' },
  { id: 8, name: '오하준', sid: '20231241', group: '개발1팀', status: 'WAITING', time: '-', location: '-', modifier: '-', note: '-' },
]

const GROUP_OPTIONS = ['전체 그룹', '개발1팀']

const STATUS_CHIPS: { value: AttendanceStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'PRESENT', label: '출석' },
  { value: 'LATE', label: '지각' },
  { value: 'ABSENT', label: '결석' },
  { value: 'WAITING', label: '대기' },
]

interface StatCard {
  label: string
  value: string
  valueClassName?: string
}

const AttendancePage = () => {
  const [group, setGroup] = useState(GROUP_OPTIONS[0])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | 'ALL'>('ALL')

  const filtered = useMemo(() => {
    return ATTENDANCE_RECORDS.filter((r) => {
      const matchesGroup = group === '전체 그룹' || r.group === group
      const matchesSearch = r.name.includes(search.trim())
      const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter
      return matchesGroup && matchesSearch && matchesStatus
    })
  }, [group, search, statusFilter])

  const counts = useMemo(() => {
    const present = ATTENDANCE_RECORDS.filter((r) => r.status === 'PRESENT').length
    const late = ATTENDANCE_RECORDS.filter((r) => r.status === 'LATE').length
    const absent = ATTENDANCE_RECORDS.filter((r) => r.status === 'ABSENT').length
    return { total: ATTENDANCE_RECORDS.length, present, late, absent }
  }, [])

  // 목업 기준 출석률은 present/total의 단순 계산이 아니라 정적으로 박혀있던 값(50%)이라
  // 여기서는 소수점 없이 반올림한 present/total로 대체 (실 연동 때 백엔드 계산값으로 교체)
  const rate = Math.round((counts.present / counts.total) * 100)

  const statCards: StatCard[] = [
    { label: '대상자 수', value: `${counts.total}명` },
    { label: '출석', value: `${counts.present}명`, valueClassName: 'text-[oklch(42%_0.13_152)]' },
    { label: '지각', value: `${counts.late}명`, valueClassName: 'text-[oklch(50%_0.14_75)]' },
    { label: '결석', value: `${counts.absent}명`, valueClassName: 'text-[oklch(48%_0.18_20)]' },
    { label: '출석률', value: `${rate}%` },
  ]

  const muted = (value: string) => <span className="text-[#6b7280]">{value}</span>

  const columns: TableColumn<AttendanceRecord>[] = [
    { key: 'name', header: '이름', render: (row) => <span className="font-semibold">{row.name}</span> },
    { key: 'sid', header: '학번', render: (row) => muted(row.sid) },
    { key: 'group', header: '그룹', render: (row) => muted(row.group) },
    {
      key: 'status',
      header: '상태',
      render: (row) => {
        const meta = attendanceStatusMeta[row.status]
        return <Badge color={meta.color}>{meta.label}</Badge>
      },
    },
    { key: 'time', header: '출석 시간', render: (row) => muted(row.time) },
    { key: 'location', header: 'NFC 위치', render: (row) => muted(row.location) },
    { key: 'modifier', header: '수정자', render: (row) => muted(row.modifier) },
    { key: 'note', header: '비고', render: (row) => muted(row.note) },
    {
      key: 'actions',
      header: '액션',
      // TODO: 상태 수동 수정은 백엔드 출석 상태 변경 API가 붙어야 동작 - 지금은 UI만
      render: () => (
        <Button variant="secondary" size="sm">
          상태 수정
        </Button>
      ),
    },
  ]

  return (
    <>
      <div className="flex flex-wrap items-center gap-2.5">
        <select
          disabled
          value="2026-07-23"
          className="rounded-lg border border-[#dcdfe4] bg-white px-3 py-[7px] text-[13px] text-[#333]"
        >
          <option value="2026-07-23">2026-07-23</option>
        </select>
        <select
          disabled
          value="백엔드 프로젝트 주간회의"
          className="min-w-[200px] rounded-lg border border-[#dcdfe4] bg-white px-3 py-[7px] text-[13px] text-[#333]"
        >
          <option value="백엔드 프로젝트 주간회의">백엔드 프로젝트 주간회의</option>
        </select>
        <select
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          className="rounded-lg border border-[#dcdfe4] bg-white px-3 py-[7px] text-[13px] text-[#333]"
        >
          {GROUP_OPTIONS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="이름으로 검색"
          className="w-[180px] rounded-lg border border-[#dcdfe4] bg-white px-3 py-[7px] text-[13px] text-[#333] placeholder:text-[#9aa1ac]"
        />

        <div className="ml-auto flex gap-1.5">
          {STATUS_CHIPS.map((chip) => (
            <Button
              key={chip.value}
              variant="chip"
              active={statusFilter === chip.value}
              onClick={() => setStatusFilter(chip.value)}
            >
              {chip.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3.5">
        {statCards.map((card) => (
          <Card key={card.label}>
            <p className="text-xs font-medium text-[#8a8f98]">{card.label}</p>
            <p className={`mt-1 text-[22px] font-bold ${card.valueClassName ?? 'text-[#1c1e21]'}`}>{card.value}</p>
          </Card>
        ))}
      </div>

      <Table columns={columns} data={filtered} rowKey={(row) => row.id} emptyMessage="조건에 맞는 출석 기록이 없습니다." />
    </>
  )
}

export default AttendancePage
