import { useMemo, useState, type FormEvent } from 'react'
import { Badge, Button, Card, Input, Modal, Table } from '../components'
import type { TableColumn } from '../components'
import { nfcTagStatusMeta } from '../utils/badgeColors'
import type { NfcTag, NfcTagStatus } from '../types/nfcTag'

// TODO: 지금은 Claude Design 목업(Admin Web Page Mockups)의 NFC 태그 관리 화면 시드 데이터를 그대로 씀.
// 실제 연동은 GET/POST/PATCH /api/nfc-tags 등 태그 API 붙일 때(다음 STEP) 교체
const INITIAL_TAGS: NfcTag[] = [
  { id: 1, name: '강의실 201호', uid: '04:A3:B2:1C:7E:F1', location: '공학관 201호', session: '자료구조 3주차 강의', lastUsed: '2026-07-23 10:02', status: 'ACTIVE' },
  { id: 2, name: '스터디룸 401호', uid: '04:5F:9C:22:8A:B0', location: '중앙도서관 401호', session: '알고리즘 스터디 8회차', lastUsed: '2026-07-22 20:58', status: 'ACTIVE' },
  { id: 3, name: '회의실 2', uid: '04:C1:7D:44:3E:9A', location: '본사 3층 회의실2', session: '백엔드 프로젝트 주간회의', lastUsed: '2026-07-23 10:12', status: 'ACTIVE' },
  { id: 4, name: '스터디룸 402호', uid: '04:8B:11:6C:5D:2F', location: '중앙도서관 402호', session: '프론트엔드 스터디 5회차', lastUsed: '2026-07-15 21:47', status: 'ACTIVE' },
  { id: 5, name: '강의실 301호', uid: '04:2E:9A:C7:10:44', location: '공학관 301호', session: null, lastUsed: '2026-06-30 09:14', status: 'INACTIVE' },
  { id: 6, name: '강의실 302호', uid: '04:D9:33:1F:88:0C', location: '공학관 302호', session: null, lastUsed: null, status: 'ACTIVE' },
]

const STATUS_FILTERS: { value: NfcTagStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'ACTIVE', label: '활성' },
  { value: 'INACTIVE', label: '비활성' },
]

interface TagFormState {
  name: string
  uid: string
  location: string
  session: string
}

const emptyForm: TagFormState = { name: '', uid: '', location: '', session: '' }

// 새 태그 등록할 때 UID를 직접 입력하기 번거로우니 임의로 하나 만들어서 채워줌(실제로는 하드웨어가 UID를 갖고 있음)
const generateUid = () =>
  Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, '0')
      .toUpperCase(),
  ).join(':')

const NfcTagsPage = () => {
  const [tags, setTags] = useState<NfcTag[]>(INITIAL_TAGS)
  const [statusFilter, setStatusFilter] = useState<NfcTagStatus | 'ALL'>('ALL')
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<TagFormState>(emptyForm)

  const filtered = useMemo(() => {
    return tags.filter((t) => statusFilter === 'ALL' || t.status === statusFilter)
  }, [tags, statusFilter])

  // 목업의 통계 카드 4개도 실제 태그 목록(6건)이랑 무관한 정적 값이라 그대로 둠
  const statCards = [
    { label: '전체 태그', value: '12개' },
    { label: '활성 태그', value: '9개' },
    { label: '비활성 태그', value: '3개' },
    { label: '오늘 인식 횟수', value: '24회' },
  ]

  const toggleStatus = (id: number) => {
    setTags((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: t.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : t)),
    )
  }

  const openCreate = () => {
    setForm({ ...emptyForm, uid: generateUid() })
    setEditingId(null)
    setFormMode('create')
  }

  const openEdit = (tag: NfcTag) => {
    setForm({ name: tag.name, uid: tag.uid, location: tag.location, session: tag.session ?? '' })
    setEditingId(tag.id)
    setFormMode('edit')
  }

  const closeForm = () => setFormMode(null)

  const handleSubmitForm = (e: FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.uid.trim() || !form.location.trim()) return

    if (formMode === 'edit' && editingId !== null) {
      // TODO: 실제로는 PATCH /api/nfc-tags/:id 로 보내고 응답값으로 대체
      setTags((prev) =>
        prev.map((t) =>
          t.id === editingId
            ? {
                ...t,
                name: form.name.trim(),
                uid: form.uid.trim(),
                location: form.location.trim(),
                session: form.session.trim() || null,
              }
            : t,
        ),
      )
    } else {
      // TODO: 실제로는 POST /api/nfc-tags 로 보내고 응답값(실제 UID 등)으로 대체
      const newTag: NfcTag = {
        id: Date.now(),
        name: form.name.trim(),
        uid: form.uid.trim(),
        location: form.location.trim(),
        session: form.session.trim() || null,
        lastUsed: null,
        status: 'ACTIVE',
      }
      setTags((prev) => [newTag, ...prev])
    }
    closeForm()
  }

  const muted = (value: string | null) => <span className="text-[#6b7280]">{value ?? '-'}</span>

  const columns: TableColumn<NfcTag>[] = [
    { key: 'name', header: '태그명', render: (row) => <span className="font-semibold">{row.name}</span> },
    {
      key: 'uid',
      header: 'UID',
      render: (row) => <span className="font-mono text-[12.5px] text-[#6b7280]">{row.uid}</span>,
    },
    { key: 'location', header: '설치 위치', render: (row) => muted(row.location) },
    { key: 'session', header: '연결된 세션', render: (row) => muted(row.session) },
    { key: 'lastUsed', header: '마지막 사용', render: (row) => muted(row.lastUsed) },
    {
      key: 'status',
      header: '상태',
      render: (row) => {
        const meta = nfcTagStatusMeta[row.status]
        return <Badge color={meta.color}>{meta.label}</Badge>
      },
    },
    {
      key: 'actions',
      header: '액션',
      render: (row) => (
        <div className="flex gap-1.5">
          <Button variant="secondary" size="sm" onClick={() => openEdit(row)}>
            수정
          </Button>
          <Button variant="secondary" size="sm" onClick={() => toggleStatus(row.id)}>
            {row.status === 'ACTIVE' ? '비활성화' : '활성화'}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      {/* ===== UI: 통계 카드 4개 (전체/활성/비활성 태그 수, 오늘 인식 횟수 - 전부 정적 값) ===== */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.label}>
            <p className="text-xs font-medium text-[#8a8f98]">{card.label}</p>
            <p className="mt-1 text-[22px] font-bold text-[#1c1e21]">{card.value}</p>
          </Card>
        ))}
      </div>

      {/* ===== UI: 상태 필터 + 신규 태그 등록 버튼 ===== */}
      <div className="flex items-center justify-between">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as NfcTagStatus | 'ALL')}
          className="rounded-lg border border-[#dcdfe4] bg-white px-3 py-[7px] text-[13px] text-[#333]"
        >
          {STATUS_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <Button onClick={openCreate}>+ 신규 태그 등록</Button>
      </div>

      {/* ===== UI: 태그 목록 표 (UID 컬럼은 font-mono로 렌더) ===== */}
      <Table columns={columns} data={filtered} rowKey={(row) => row.id} emptyMessage="조건에 맞는 태그가 없습니다." />

      {/* ===== UI: 등록/수정 폼 모달 - 목업엔 이 폼 시안이 없어서 직접 구성 ===== */}
      <Modal open={formMode !== null} onClose={closeForm} title={formMode === 'edit' ? '태그 수정' : '신규 태그 등록'}>
        <form onSubmit={handleSubmitForm} className="flex flex-col gap-3.5">
          <Input
            label="태그명"
            placeholder="예: 강의실 303호"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <div>
            {/* 등록 시엔 generateUid()로 임의 값을 채워두지만, 실제 하드웨어 UID로 바꿔 넣을 수 있게 수정 가능하게 열어둠 */}
            <Input
              label="UID"
              placeholder="예: 04:A3:B2:1C:7E:F1"
              value={form.uid}
              onChange={(e) => setForm((f) => ({ ...f, uid: e.target.value }))}
              className="font-mono"
              required
            />
            <p className="mt-[5px] text-[11.5px] text-[#9aa1ac]">실제 태그에 새겨진 UID와 다르면 인식이 안 되니 정확히 입력하세요.</p>
          </div>
          <Input
            label="설치 위치"
            placeholder="예: 공학관 303호"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            required
          />
          <Input
            label="연결된 세션 (선택)"
            placeholder="예: 자료구조 3주차 강의"
            value={form.session}
            onChange={(e) => setForm((f) => ({ ...f, session: e.target.value }))}
          />
          <div className="mt-1 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={closeForm}>
              취소
            </Button>
            <Button type="submit">{formMode === 'edit' ? '저장' : '등록'}</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}

export default NfcTagsPage
