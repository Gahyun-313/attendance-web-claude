// 출석 세션 관리 화면. 세션 목록을 조회/검색/필터링하고, 생성·수정·시작·종료할 수 있다.
// 2026-07-23(STEP19): 로컬 시드 데이터 대신 실제 백엔드 API(GET/POST/PUT /api/sessions 등) 연동
import { useMemo, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Badge, Button, Input, Modal, Select, Table } from '../components'
import type { TableColumn } from '../components'
import { sessionStatusMeta } from '../utils/badgeColors'
import { GROUPS } from '../utils/groups'
import { closeSession, createSession, listSessions, startSession, updateSession } from '../api/sessions'
import { listNfcTags } from '../api/nfcTags'
import type { Session, SessionRequest, SessionStatus } from '../types/session'

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

// 생성/수정 모달 둘 다 이 필드 - 목업엔 세션 생성/수정 폼 시안이 없어서 실제 SessionRequest 필드 기준으로 직접 구성
interface SessionFormState {
  name: string
  group: string
  date: string
  startTime: string
  endTime: string
  location: string
  nfcTagId: string
  lateThresholdMinutes: string
  note: string
}

const emptyForm: SessionFormState = {
  name: '',
  group: GROUPS[0],
  date: '',
  startTime: '',
  endTime: '',
  location: '',
  nfcTagId: '',
  lateThresholdMinutes: '10',
  note: '',
}

// "시작–종료" 형태로 합쳐진 Session.time을 폼 편집용으로 다시 나눔 (mapSession의 반대 방향)
const splitTime = (time: string): [string, string] => {
  const [start, end] = time.split('–')
  return [start ?? '', end ?? '']
}

// "시작 후 N분" 형태의 Session.lateThreshold에서 숫자만 뽑음
const parseLateThreshold = (label: string): string => label.match(/\d+/)?.[0] ?? '10'

const SessionsPage = () => {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<SessionStatus | 'ALL'>('ALL')
  const [search, setSearch] = useState('')
  const [detailId, setDetailId] = useState<number | null>(null)
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<SessionFormState>(emptyForm)

  const sessionsQuery = useQuery({ queryKey: ['sessions'], queryFn: listSessions })
  const nfcTagsQuery = useQuery({ queryKey: ['nfcTags'], queryFn: listNfcTags })
  const sessions = sessionsQuery.data ?? []
  const nfcTags = nfcTagsQuery.data ?? []

  const invalidateSessions = () => queryClient.invalidateQueries({ queryKey: ['sessions'] })

  const createMutation = useMutation({ mutationFn: createSession, onSuccess: invalidateSessions })
  const updateMutation = useMutation({
    mutationFn: ({ id, req }: { id: number; req: SessionRequest }) => updateSession(id, req),
    onSuccess: invalidateSessions,
  })
  const startMutation = useMutation({ mutationFn: startSession, onSuccess: invalidateSessions })
  const closeMutation = useMutation({ mutationFn: closeSession, onSuccess: invalidateSessions })
  // TODO: 세션 취소(POST /api/sessions/:id/cancel)는 백엔드엔 있는데 목업/화면 정의에 버튼이 없어서 아직 연결 안 함
  // - 필요해지면 api/sessions.ts의 cancelSession을 여기서 mutation으로 감싸고 상세 모달에 버튼만 추가하면 됨

  // 상태 필터 + 세션명 검색어를 둘 다 만족하는 세션만 걸러서 표에 보여줌
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
    const [startTime, endTime] = splitTime(session.time)
    setForm({
      name: session.name,
      group: session.group,
      date: session.date,
      startTime,
      endTime,
      location: session.location,
      nfcTagId: session.nfcTagId ? String(session.nfcTagId) : '',
      lateThresholdMinutes: parseLateThreshold(session.lateThreshold),
      note: session.note,
    })
    setEditingId(session.id)
    setFormMode('edit')
  }

  const closeForm = () => setFormMode(null)

  const handleSubmitForm = (e: FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.date.trim() || !form.startTime.trim() || !form.endTime.trim() || !form.nfcTagId) return

    const req: SessionRequest = {
      title: form.name.trim(),
      description: form.name.trim(), // 목업/화면 정의엔 별도 "설명" 필드가 없어서 세션명으로 채움 (TODO: 필요하면 폼에 필드 추가)
      groupName: form.group,
      sessionDate: form.date.trim(),
      startTime: form.startTime.trim(),
      endTime: form.endTime.trim(),
      lateThresholdMinutes: Number(form.lateThresholdMinutes) || 10,
      location: form.location.trim(),
      nfcTagId: Number(form.nfcTagId),
      note: form.note.trim(),
    }

    if (formMode === 'edit' && editingId !== null) {
      updateMutation.mutate({ id: editingId, req })
    } else {
      createMutation.mutate(req)
    }
    closeForm()
  }

  // 세션 시작/종료 - 실제 상태 전이 API(POST /api/sessions/:id/start, /close) 호출
  const advanceStatus = (session: Session) => {
    if (session.status === 'SCHEDULED') startMutation.mutate(session.id)
    else if (session.status === 'ACTIVE') closeMutation.mutate(session.id)
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
      <Table
        columns={columns}
        data={filtered}
        rowKey={(row) => row.id}
        emptyMessage={sessionsQuery.isLoading ? '불러오는 중...' : '조건에 맞는 세션이 없습니다.'}
      />

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
                    advanceStatus(detailSession)
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

      {/* ===== UI: 세션 생성/수정 폼 모달 - 목업엔 이 폼 시안이 없어서 실제 SessionRequest 필드 기준으로 직접 구성 ===== */}
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
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              required
            />
            <Input
              label="시작 시간"
              type="time"
              value={form.startTime}
              onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
              required
            />
            <Input
              label="종료 시간"
              type="time"
              value={form.endTime}
              onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
              required
            />
          </div>
          <Input
            label="장소"
            placeholder="예: 공학관 201호"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
          />
          <div>
            <Select
              label="NFC 태그"
              value={form.nfcTagId}
              onChange={(e) => setForm((f) => ({ ...f, nfcTagId: e.target.value }))}
              required
            >
              {nfcTags.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.uid})
                </option>
              ))}
            </Select>
            <p className="mt-[5px] text-[11.5px] text-[#9aa1ac]">
              동일 태그가 이미 다른 세션에서 진행중이면 세션 시작 시 서버에서 거절될 수 있습니다.
            </p>
          </div>
          <Input
            label="지각 인정 (분)"
            type="number"
            min={0}
            value={form.lateThresholdMinutes}
            onChange={(e) => setForm((f) => ({ ...f, lateThresholdMinutes: e.target.value }))}
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
