// 출석 현황 화면. 특정 세션의 출석 기록을 표로 보여주고, 그룹/이름/상태로 필터링하며
// 개별 기록의 출석 상태(출석/지각/결석/대기)를 관리자가 수동으로 수정할 수 있다
import { useMemo, useState, type FormEvent } from 'react'
import { Badge, Button, Card, Modal, Select, Table } from '../components'
import type { TableColumn } from '../components'
import { attendanceStatusMeta } from '../utils/badgeColors'
import type { AttendanceRecord, AttendanceStatus } from '../types/attendance'
import type { User } from '../types/user'

// TODO: 지금은 Claude Design 목업(Admin Web Page Mockups)의 출석 현황 화면 시드 데이터를 그대로 씀.
// 실제 연동은 GET/PATCH /api/attendances 등 출석 API 붙일 때(다음 STEP) 교체.
// 목업이 세션 1개(백엔드 프로젝트 주간회의) 기준 데이터만 갖고 있어서 날짜/세션 select는 지금은
// 옵션이 하나뿐인 정적 값 - 실제로는 세션 목록 API로 채워야 함
const INITIAL_RECORDS: AttendanceRecord[] = [
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

// 상태 수정 시 "수정자" 칸에 남길 이름 - 로그인 응답으로 저장해둔 관리자 정보 재사용
const currentAdminName = (): string => {
  const raw = localStorage.getItem('user')
  if (!raw) return '관리자'
  try {
    return `${(JSON.parse(raw) as User).name}(관리자)`
  } catch {
    return '관리자'
  }
}

const AttendancePage = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>(INITIAL_RECORDS)
  const [group, setGroup] = useState(GROUP_OPTIONS[0])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | 'ALL'>('ALL')
  const [editId, setEditId] = useState<number | null>(null)
  const [editStatus, setEditStatus] = useState<AttendanceStatus>('PRESENT')
  const [editNote, setEditNote] = useState('')

  // 그룹 + 이름 검색 + 상태 필터 세 조건을 모두 만족하는 출석 기록만 표에 보여줌
  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchesGroup = group === '전체 그룹' || r.group === group
      const matchesSearch = r.name.includes(search.trim())
      const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter
      return matchesGroup && matchesSearch && matchesStatus
    })
  }, [records, group, search, statusFilter])

  // 상단 통계 카드에 쓸 상태별 인원 수 - 필터와 무관하게 전체 records 기준으로 집계
  const counts = useMemo(() => {
    const present = records.filter((r) => r.status === 'PRESENT').length
    const late = records.filter((r) => r.status === 'LATE').length
    const absent = records.filter((r) => r.status === 'ABSENT').length
    return { total: records.length, present, late, absent }
  }, [records])

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

  const editingRecord = records.find((r) => r.id === editId) ?? null

  const openEdit = (row: AttendanceRecord) => {
    setEditId(row.id)
    setEditStatus(row.status)
    setEditNote(row.note === '-' ? '' : row.note)
  }
  const closeEdit = () => setEditId(null)

  const handleSaveStatus = (e: FormEvent) => {
    e.preventDefault()
    if (editId === null) return
    // TODO: 실제로는 PATCH /api/attendances/:id 로 보내고 응답값으로 대체
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id !== editId) return r
        const now = new Date()
        const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
        return {
          ...r,
          status: editStatus,
          note: editNote.trim() === '' ? '-' : editNote.trim(),
          modifier: currentAdminName(),
          time: r.time === '-' && editStatus !== 'WAITING' ? nowTime : r.time,
        }
      }),
    )
    closeEdit()
  }

  const muted = (value: string) => <span className="text-[#6b7280]">{value}</span>

  // width를 다 지정해서 fixedLayout으로 그림 - 안 그러면 필터링할 때마다 남아있는 행들 내용 길이에 따라
  // 브라우저가 컬럼 폭을 다시 계산해서(table-layout:auto 기본값) 셀 안쪽 여백이 필터마다 달라 보임
  // 이름/학번/그룹/상태/출석시간/수정자는 전부 같은 폭(SAME_WIDTH), 비고/NFC위치는 한글 10자 기준 폭(약 130px)
  const SAME_WIDTH = '96px'
  const TEN_CHAR_WIDTH = '130px'
  const truncated = (value: string) => (
    <span className="block truncate text-[#6b7280]" title={value}>
      {value}
    </span>
  )

  const columns: TableColumn<AttendanceRecord>[] = [
    {
      key: 'name',
      header: '이름',
      width: SAME_WIDTH,
      render: (row) => <span className="font-semibold">{row.name}</span>,
    },
    { key: 'sid', header: '학번', width: SAME_WIDTH, render: (row) => muted(row.sid) },
    { key: 'group', header: '그룹', width: SAME_WIDTH, render: (row) => muted(row.group) },
    {
      key: 'status',
      header: '상태',
      width: SAME_WIDTH,
      render: (row) => {
        const meta = attendanceStatusMeta[row.status]
        return <Badge color={meta.color}>{meta.label}</Badge>
      },
    },
    { key: 'time', header: '출석 시간', width: SAME_WIDTH, render: (row) => muted(row.time) },
    { key: 'location', header: 'NFC 위치', width: TEN_CHAR_WIDTH, render: (row) => muted(row.location) },
    { key: 'modifier', header: '수정자', width: SAME_WIDTH, render: (row) => muted(row.modifier) },
    {
      key: 'note',
      header: '비고',
      width: TEN_CHAR_WIDTH,
      render: (row) => truncated(row.note),
    },
    {
      key: 'actions',
      header: '액션',
      width: '96px',
      render: (row) => (
        <Button variant="secondary" size="sm" onClick={() => openEdit(row)}>
          상태 수정
        </Button>
      ),
    },
  ]

  return (
    <>
      {/* ===== UI: 상단 필터바 (날짜/세션은 옵션 1개뿐이라 비활성 표시, 그룹/검색은 실제 동작, 상태 칩은 오른쪽 정렬) ===== */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* ----- UI: 날짜 select - 세션이 여러 개 생기기 전까지는 옵션이 하나뿐이라 비활성 ----- */}
        <select
          disabled
          value="2026-07-23"
          className="rounded-lg border border-[#dcdfe4] bg-white px-3 py-[7px] text-[13px] text-[#333]"
        >
          <option value="2026-07-23">2026-07-23</option>
        </select>
        {/* ----- UI: 세션 select - 위와 동일한 이유로 비활성 ----- */}
        <select
          disabled
          value="백엔드 프로젝트 주간회의"
          className="min-w-[200px] rounded-lg border border-[#dcdfe4] bg-white px-3 py-[7px] text-[13px] text-[#333]"
        >
          <option value="백엔드 프로젝트 주간회의">백엔드 프로젝트 주간회의</option>
        </select>
        {/* ----- UI: 그룹 select (실제 필터링됨) ----- */}
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
        {/* ----- UI: 이름 검색 입력칸 ----- */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="이름으로 검색"
          className="w-[180px] rounded-lg border border-[#dcdfe4] bg-white px-3 py-[7px] text-[13px] text-[#333] placeholder:text-[#9aa1ac]"
        />

        {/* ----- UI: 상태 필터 칩(전체/출석/지각/결석/대기) - 오른쪽 끝으로 밀어냄(ml-auto) ----- */}
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

      {/* ===== UI: 통계 카드 5개 (대상자수/출석/지각/결석/출석률) ===== */}
      <div className="grid grid-cols-5 gap-3.5">
        {statCards.map((card) => (
          <Card key={card.label}>
            <p className="text-xs font-medium text-[#8a8f98]">{card.label}</p>
            <p className={`mt-1 text-[22px] font-bold ${card.valueClassName ?? 'text-[#1c1e21]'}`}>{card.value}</p>
          </Card>
        ))}
      </div>

      {/* ===== UI: 출석 기록 표 (fixedLayout - 필터 바꿔도 컬럼 폭 안 흔들리게, 위쪽 columns에서 각 컬럼 width 지정) ===== */}
      <Table
        columns={columns}
        data={filtered}
        rowKey={(row) => row.id}
        emptyMessage="조건에 맞는 출석 기록이 없습니다."
        fixedLayout
      />

      {/* ===== UI: 상태 수정 모달 - 목업엔 이 폼 시안이 없어서 직접 구성 ===== */}
      <Modal open={editingRecord !== null} onClose={closeEdit} title={editingRecord ? `${editingRecord.name} 상태 수정` : ''}>
        {editingRecord && (
          <form onSubmit={handleSaveStatus} className="flex flex-col gap-3.5">
            <Select label="상태" value={editStatus} onChange={(e) => setEditStatus(e.target.value as AttendanceStatus)}>
              <option value="PRESENT">출석</option>
              <option value="LATE">지각</option>
              <option value="ABSENT">결석</option>
              <option value="WAITING">대기</option>
            </Select>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12.5px] font-semibold text-[#4b5563]">비고 (선택)</label>
              <textarea
                rows={2}
                placeholder="사유를 입력하세요"
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                className="w-full resize-none rounded-lg border border-[#dcdfe4] bg-white px-3 py-2 font-sans text-[13px] text-[#1c1e21] placeholder:text-[#9aa1ac] focus:outline-none focus:ring-1 focus:ring-[oklch(55%_0.16_258)]"
              />
            </div>
            <p className="text-[11.5px] text-[#9aa1ac]">저장하면 수정자란에 현재 로그인한 관리자 이름이 기록됩니다.</p>
            <div className="mt-1 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={closeEdit}>
                취소
              </Button>
              <Button type="submit">저장</Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  )
}

export default AttendancePage
