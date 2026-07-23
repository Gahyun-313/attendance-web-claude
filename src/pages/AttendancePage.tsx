// 출석 현황 화면. 세션 하나를 골라 그 세션의 출석 기록을 표로 보여주고, 그룹/이름/상태로 필터링하며
// 개별 기록의 출석 상태(출석/지각/결석/대기)를 관리자가 수동으로 수정할 수 있다.
// 2026-07-23(STEP19): 로컬 시드 데이터 대신 실제 백엔드 API 연동
// (GET /api/attendances/sessions/{id}, /{id}/status, /{id}/dashboard). 목업은 세션 1개 기준 정적 화면이었지만
// 실제 API는 세션 단위로 조회해야 해서 상단에 세션 선택 select를 새로 추가함
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Badge, Button, Card, Modal, Select, Table } from '../components'
import type { TableColumn } from '../components'
import { attendanceStatusMeta } from '../utils/badgeColors'
import type { AttendanceRecord, AttendanceStatus } from '../types/attendance'
import { getAttendanceDashboard, listAttendancesBySession, updateAttendanceStatus } from '../api/attendances'
import { listSessions } from '../api/sessions'

const GROUP_OPTIONS_BASE = ['전체 그룹']

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
  const queryClient = useQueryClient()
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null)
  const [group, setGroup] = useState(GROUP_OPTIONS_BASE[0])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | 'ALL'>('ALL')
  const [editId, setEditId] = useState<number | null>(null)
  const [editStatus, setEditStatus] = useState<AttendanceStatus>('PRESENT')
  const [editReason, setEditReason] = useState('')

  const sessionsQuery = useQuery({ queryKey: ['sessions'], queryFn: listSessions })
  const sessions = sessionsQuery.data ?? []

  // 세션 목록이 로드되면 기본으로 진행중인 세션을(없으면 첫 세션을) 선택해줌
  useEffect(() => {
    if (selectedSessionId !== null || sessions.length === 0) return
    const active = sessions.find((s) => s.status === 'ACTIVE')
    setSelectedSessionId((active ?? sessions[0]).id)
  }, [sessions, selectedSessionId])

  const attendanceQuery = useQuery({
    queryKey: ['attendances', selectedSessionId],
    queryFn: () => listAttendancesBySession(selectedSessionId as number),
    enabled: selectedSessionId !== null,
  })
  const dashboardQuery = useQuery({
    queryKey: ['attendanceDashboard', selectedSessionId],
    queryFn: () => getAttendanceDashboard(selectedSessionId as number),
    enabled: selectedSessionId !== null,
  })
  const records = attendanceQuery.data ?? []

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, modifyReason }: { id: number; status: AttendanceStatus; modifyReason: string }) =>
      updateAttendanceStatus(id, { status, modifyReason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendances', selectedSessionId] })
      queryClient.invalidateQueries({ queryKey: ['attendanceDashboard', selectedSessionId] })
    },
  })

  const groupOptions = useMemo(() => {
    const groups = Array.from(new Set(records.map((r) => r.group).filter((g) => g !== '-')))
    return [...GROUP_OPTIONS_BASE, ...groups]
  }, [records])

  // 그룹 + 이름 검색 + 상태 필터 세 조건을 모두 만족하는 출석 기록만 표에 보여줌
  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchesGroup = group === '전체 그룹' || r.group === group
      const matchesSearch = r.name.includes(search.trim())
      const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter
      return matchesGroup && matchesSearch && matchesStatus
    })
  }, [records, group, search, statusFilter])

  // 상단 통계 카드 - 서버의 출석 대시보드 API(dashboardQuery) 값을 그대로 사용
  const dash = dashboardQuery.data
  const rate = dash && dash.targetCount > 0 ? Math.round((dash.presentCount / dash.targetCount) * 100) : 0
  const statCards: StatCard[] = [
    { label: '대상자 수', value: `${dash?.targetCount ?? 0}명` },
    { label: '출석', value: `${dash?.presentCount ?? 0}명`, valueClassName: 'text-[oklch(42%_0.13_152)]' },
    { label: '지각', value: `${dash?.lateCount ?? 0}명`, valueClassName: 'text-[oklch(50%_0.14_75)]' },
    { label: '결석', value: `${dash?.absentCount ?? 0}명`, valueClassName: 'text-[oklch(48%_0.18_20)]' },
    { label: '출석률', value: `${rate}%` },
  ]

  const editingRecord = records.find((r) => r.id === editId) ?? null

  const openEdit = (row: AttendanceRecord) => {
    setEditId(row.id)
    setEditStatus(row.status)
    setEditReason('')
  }
  const closeEdit = () => setEditId(null)

  const handleSaveStatus = (e: FormEvent) => {
    e.preventDefault()
    if (editId === null || !editReason.trim()) return // 상태 변경 시 사유 작성 필수 (§3)
    updateStatusMutation.mutate({ id: editId, status: editStatus, modifyReason: editReason.trim() })
    closeEdit()
  }

  const muted = (value: string) => <span className="text-[#6b7280]">{value}</span>

  // width를 다 지정해서 fixedLayout으로 그림 - 안 그러면 필터링할 때마다 남아있는 행들 내용 길이에 따라
  // 브라우저가 컬럼 폭을 다시 계산해서(table-layout:auto 기본값) 셀 안쪽 여백이 필터마다 달라 보임
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
      {/* ===== UI: 상단 필터바 (세션/그룹은 실제 데이터 기준 select, 검색은 실제 동작, 상태 칩은 오른쪽 정렬) ===== */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* ----- UI: 세션 select - 실제 세션 목록에서 골라야 해당 세션의 출석 기록을 조회할 수 있음 ----- */}
        <select
          value={selectedSessionId ?? ''}
          onChange={(e) => setSelectedSessionId(Number(e.target.value))}
          className="min-w-[200px] rounded-lg border border-[#dcdfe4] bg-white px-3 py-[7px] text-[13px] text-[#333]"
        >
          {sessions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.date} · {s.name}
            </option>
          ))}
        </select>
        {/* ----- UI: 그룹 select (실제 필터링됨, 선택된 세션의 기록에 있는 그룹만 옵션으로 나옴) ----- */}
        <select
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          className="rounded-lg border border-[#dcdfe4] bg-white px-3 py-[7px] text-[13px] text-[#333]"
        >
          {groupOptions.map((g) => (
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

      {/* ===== UI: 통계 카드 5개 (대상자수/출석/지각/결석/출석률 - 출석 대시보드 API 값) ===== */}
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
        emptyMessage={attendanceQuery.isLoading ? '불러오는 중...' : '조건에 맞는 출석 기록이 없습니다.'}
        fixedLayout
      />

      {/* ===== UI: 상태 수정 모달 - 목업엔 이 폼 시안이 없어서 직접 구성. 사유(modifyReason)는 서버가 필수로 요구함(§3) ===== */}
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
              <label className="text-[12.5px] font-semibold text-[#4b5563]">수정 사유 (필수)</label>
              <textarea
                rows={2}
                placeholder="변경 사유를 입력하세요"
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                required
                className="w-full resize-none rounded-lg border border-[#dcdfe4] bg-white px-3 py-2 font-sans text-[13px] text-[#1c1e21] placeholder:text-[#9aa1ac] focus:outline-none focus:ring-1 focus:ring-[oklch(55%_0.16_258)]"
              />
            </div>
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
