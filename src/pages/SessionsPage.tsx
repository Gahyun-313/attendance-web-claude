import { useMemo, useState, type FormEvent } from 'react'
import { Badge, Button, Input, Modal, Select, Table } from '../components'
import type { TableColumn } from '../components'
import { sessionStatusMeta } from '../utils/badgeColors'
import { GROUPS } from '../utils/groups'
import type { Session, SessionStatus } from '../types/session'

// TODO: 지금은 Claude Design 목업(Admin Web Page Mockups)의 세션관리 화면 시드 데이터를 그대로 씀.
// 실제 연동은 GET/POST/PATCH /api/sessions 등 세션 API 붙일 때(다음 STEP) 교체
const INITIAL_SESSIONS: Session[] = [
  {
    id: 1,
    name: '자료구조 3주차 강의',
    group: '스터디 A조',
    date: '2026-07-21',
    time: '14:00–16:00',
    tag: 'NFC-201호',
    rate: '92%',
    status: 'COMPLETED',
    desc: '자료구조 스터디 A조 정규 강의 3주차',
    location: '공학관 201호',
    lateThreshold: '시작 후 10분',
    note: '-',
  },
  {
    id: 2,
    name: '알고리즘 스터디 8회차',
    group: '스터디 B조',
    date: '2026-07-22',
    time: '19:00–21:00',
    tag: 'NFC-401호',
    rate: '88%',
    status: 'COMPLETED',
    desc: '알고리즘 스터디 B조 정기 모임 8회차',
    location: '중앙도서관 401호',
    lateThreshold: '시작 후 10분',
    note: '-',
  },
  {
    id: 3,
    name: '백엔드 프로젝트 주간회의',
    group: '개발1팀',
    date: '2026-07-23',
    time: '10:00–11:00',
    tag: 'NFC-회의실2',
    rate: '38%',
    status: 'ACTIVE',
    desc: '백엔드 프로젝트 개발1팀 주간 진행상황 공유',
    location: '본사 3층 회의실2',
    lateThreshold: '시작 후 5분',
    note: '화상 참여자는 사전 안내',
  },
  {
    id: 4,
    name: '프론트엔드 스터디 5회차',
    group: '스터디 C조',
    date: '2026-07-23',
    time: '20:00–22:00',
    tag: 'NFC-402호',
    rate: '-',
    status: 'SCHEDULED',
    desc: '프론트엔드 스터디 C조 5회차 모임',
    location: '중앙도서관 402호',
    lateThreshold: '시작 후 10분',
    note: '-',
  },
  {
    id: 5,
    name: 'CS 스터디 정기모임',
    group: 'CS스터디팀',
    date: '2026-07-20',
    time: '18:00–20:00',
    tag: 'NFC-301호',
    rate: '-',
    status: 'CANCELED',
    desc: 'CS 스터디팀 정기 모임',
    location: '공학관 301호',
    lateThreshold: '시작 후 10분',
    note: '인원 부족으로 취소',
  },
  {
    id: 6,
    name: '자료구조 4주차 강의',
    group: '스터디 A조',
    date: '2026-07-24',
    time: '14:00–16:00',
    tag: 'NFC-201호',
    rate: '-',
    status: 'SCHEDULED',
    desc: '자료구조 스터디 A조 정규 강의 4주차',
    location: '공학관 201호',
    lateThreshold: '시작 후 10분',
    note: '-',
  },
]

const STATUS_FILTERS: { value: SessionStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'SCHEDULED', label: '예정' },
  { value: 'ACTIVE', label: '진행중' },
  { value: 'COMPLETED', label: '종료' },
  { value: 'CANCELED', label: '취소' },
]

// 진행중이면 "세션 종료", 예정이면 "세션 시작" 버튼을 모달에 보여줌 - 종료/취소된 세션은 버튼 없음
const primaryActionLabel = (status: SessionStatus): string | null => {
  if (status === 'SCHEDULED') return '세션 시작'
  if (status === 'ACTIVE') return '세션 종료'
  return null
}

// 세션 시작/종료 버튼을 눌렀을 때 다음 상태로 - 종료/취소는 눌러도 그대로(버튼 자체가 안 뜸)
const nextStatus = (status: SessionStatus): SessionStatus => {
  if (status === 'SCHEDULED') return 'ACTIVE'
  if (status === 'ACTIVE') return 'COMPLETED'
  return status
}

// 생성/수정 모달 둘 다 이 필드 - 목업엔 세션 생성/수정 폼 시안이 없어서 세션 상세 모달과 같은 필드로 직접 구성
interface SessionFormState {
  name: string
  group: string
  date: string
  time: string
  location: string
  tag: string
  lateThreshold: string
  note: string
}

const emptyForm: SessionFormState = {
  name: '',
  group: GROUPS[0],
  date: '',
  time: '',
  location: '',
  tag: '',
  lateThreshold: '시작 후 10분',
  note: '',
}

const SessionsPage = () => {
  const [sessions, setSessions] = useState<Session[]>(INITIAL_SESSIONS)
  const [statusFilter, setStatusFilter] = useState<SessionStatus | 'ALL'>('ALL')
  const [search, setSearch] = useState('')
  const [detailId, setDetailId] = useState<number | null>(null)
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<SessionFormState>(emptyForm)

  const filtered = useMemo(() => {
    return sessions.filter((s) => {
      const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter
      const matchesSearch = s.name.includes(search.trim())
      return matchesStatus && matchesSearch
    })
  }, [sessions, statusFilter, search])

  const detailSession = sessions.find((s) => s.id === detailId) ?? null

  const openCreate = () => {
    setForm(emptyForm)
    setEditingId(null)
    setFormMode('create')
  }

  const openEdit = (session: Session) => {
    setForm({
      name: session.name,
      group: session.group,
      date: session.date,
      time: session.time,
      location: session.location,
      tag: session.tag,
      lateThreshold: session.lateThreshold,
      note: session.note,
    })
    setEditingId(session.id)
    setFormMode('edit')
  }

  const closeForm = () => setFormMode(null)

  const handleSubmitForm = (e: FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.date.trim() || !form.time.trim()) return

    if (formMode === 'edit' && editingId !== null) {
      setSessions((prev) => prev.map((s) => (s.id === editingId ? { ...s, ...form } : s)))
    } else {
      // TODO: 실제로는 POST /api/sessions로 보내고 응답값으로 대체
      const newSession: Session = {
        id: Date.now(),
        ...form,
        rate: '-',
        status: 'SCHEDULED',
        desc: form.name,
      }
      setSessions((prev) => [newSession, ...prev])
    }
    closeForm()
  }

  // 세션 시작/종료 - 목업엔 핸들러가 없었는데 실제로 상태가 바뀌도록 구현 (클라이언트 한정)
  const advanceStatus = (id: number) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, status: nextStatus(s.status) } : s)))
  }

  const muted = (value: string) => <span className="text-[#6b7280]">{value}</span>

  const columns: TableColumn<Session>[] = [
    { key: 'name', header: '세션명', render: (row) => <span className="font-semibold">{row.name}</span> },
    { key: 'group', header: '그룹', render: (row) => muted(row.group) },
    { key: 'date', header: '날짜', render: (row) => muted(row.date) },
    { key: 'time', header: '시간', render: (row) => muted(row.time) },
    { key: 'tag', header: 'NFC 태그', render: (row) => muted(row.tag) },
    { key: 'rate', header: '출석률' },
    {
      key: 'status',
      header: '상태',
      render: (row) => {
        const meta = sessionStatusMeta[row.status]
        return <Badge color={meta.color}>{meta.label}</Badge>
      },
    },
    {
      key: 'actions',
      header: '액션',
      render: (row) => (
        <div className="flex gap-1.5">
          <Button variant="secondary" size="sm" onClick={() => setDetailId(row.id)}>
            상세
          </Button>
          <Button variant="secondary" size="sm" onClick={() => openEdit(row)}>
            수정
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      {/* ===== UI: 상태 필터 select + 세션명 검색 입력칸 + 새 세션 생성 버튼 ===== */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as SessionStatus | 'ALL')}
            className="rounded-lg border border-[#dcdfe4] bg-white px-3 py-[7px] text-[13px] text-[#333]"
          >
            {STATUS_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="세션명 검색"
            className="w-[220px] rounded-lg border border-[#dcdfe4] bg-white px-3 py-[7px] text-[13px] text-[#333] placeholder:text-[#9aa1ac]"
          />
        </div>
        <Button onClick={openCreate}>+ 새 세션 생성</Button>
      </div>

      {/* ===== UI: 세션 목록 표 (컬럼 정의는 위쪽 columns 참고) ===== */}
      <Table columns={columns} data={filtered} rowKey={(row) => row.id} emptyMessage="조건에 맞는 세션이 없습니다." />

      {/* ===== UI: 세션 상세 모달 (상세 버튼으로 열림, 배지/필드 나열 + 하단 버튼 3개) ===== */}
      <Modal
        open={detailSession !== null}
        onClose={() => setDetailId(null)}
        title={detailSession?.name}
        footer={
          detailSession && (
            <>
              <Button variant="secondary" onClick={() => setDetailId(null)}>
                닫기
              </Button>
              <Button variant="secondary" onClick={() => openEdit(detailSession)}>
                수정
              </Button>
              {primaryActionLabel(detailSession.status) && (
                <Button
                  onClick={() => {
                    advanceStatus(detailSession.id)
                    setDetailId(null)
                  }}
                >
                  {primaryActionLabel(detailSession.status)}
                </Button>
              )}
            </>
          )
        }
      >
        {detailSession && (
          <>
            <div className="-mt-2 mb-4">
              <Badge color={sessionStatusMeta[detailSession.status].color}>
                {sessionStatusMeta[detailSession.status].label}
              </Badge>
            </div>
            <p className="mb-[18px] text-[13px] leading-relaxed text-[#6b7280]">{detailSession.desc}</p>
            <div className="grid grid-cols-[100px_1fr] gap-y-2.5 text-[13px]">
              <span className="text-[#9aa1ac]">그룹</span>
              <span className="font-medium text-[#1c1e21]">{detailSession.group}</span>
              <span className="text-[#9aa1ac]">날짜</span>
              <span className="font-medium text-[#1c1e21]">{detailSession.date}</span>
              <span className="text-[#9aa1ac]">시간</span>
              <span className="font-medium text-[#1c1e21]">{detailSession.time}</span>
              <span className="text-[#9aa1ac]">장소</span>
              <span className="font-medium text-[#1c1e21]">{detailSession.location}</span>
              <span className="text-[#9aa1ac]">NFC 태그</span>
              <span className="font-medium text-[#1c1e21]">{detailSession.tag}</span>
              <span className="text-[#9aa1ac]">지각 인정</span>
              <span className="font-medium text-[#1c1e21]">{detailSession.lateThreshold}</span>
              <span className="text-[#9aa1ac]">출석률</span>
              <span className="font-medium text-[#1c1e21]">{detailSession.rate}</span>
              <span className="text-[#9aa1ac]">비고</span>
              <span className="font-medium text-[#1c1e21]">{detailSession.note}</span>
            </div>
          </>
        )}
      </Modal>

      {/* ===== UI: 세션 생성/수정 폼 모달 - 목업엔 이 폼 시안이 없어서 세션 상세 모달과 같은 필드로 직접 구성 ===== */}
      <Modal open={formMode !== null} onClose={closeForm} title={formMode === 'edit' ? '세션 수정' : '새 세션 생성'}>
        <form onSubmit={handleSubmitForm} className="flex flex-col gap-3.5">
          <Input
            label="세션명"
            placeholder="예: 자료구조 5주차 강의"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <Select label="그룹" value={form.group} onChange={(e) => setForm((f) => ({ ...f, group: e.target.value }))}>
            {GROUPS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </Select>
          <div className="flex gap-3">
            <Input
              label="날짜"
              placeholder="YYYY-MM-DD"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              required
            />
            <Input
              label="시간"
              placeholder="14:00–16:00"
              value={form.time}
              onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
              required
            />
          </div>
          <Input
            label="장소"
            placeholder="예: 공학관 201호"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
          />
          <Input
            label="NFC 태그"
            placeholder="예: NFC-201호"
            value={form.tag}
            onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value }))}
          />
          <Input
            label="지각 인정"
            placeholder="예: 시작 후 10분"
            value={form.lateThreshold}
            onChange={(e) => setForm((f) => ({ ...f, lateThreshold: e.target.value }))}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-semibold text-[#4b5563]">비고 (선택)</label>
            <textarea
              rows={2}
              placeholder="메모를 입력하세요"
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              className="w-full resize-none rounded-lg border border-[#dcdfe4] bg-white px-3 py-2 font-sans text-[13px] text-[#1c1e21] placeholder:text-[#9aa1ac] focus:outline-none focus:ring-1 focus:ring-[oklch(55%_0.16_258)]"
            />
          </div>
          <div className="mt-1 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={closeForm}>
              취소
            </Button>
            <Button type="submit">{formMode === 'edit' ? '저장' : '생성'}</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}

export default SessionsPage
