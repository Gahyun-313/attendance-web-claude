// NFC 태그 관리 화면. 태그 목록을 조회/필터링하고, 등록·수정 및 활성/비활성 전환을 할 수 있다.
// 2026-07-23(STEP19): 로컬 시드 데이터 대신 실제 백엔드 API 연동 (GET/POST/PUT /api/nfc-tags, activate/deactivate).
// 상태값도 목업 기준 2종(ACTIVE/INACTIVE)에서 실제 백엔드 4종(ACTIVE/INACTIVE/LOST/DAMAGED)으로 확장함
import { useMemo, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Badge, Button, Card, Input, Modal, Table } from '../components'
import type { TableColumn } from '../components'
import { nfcTagStatusMeta } from '../utils/badgeColors'
import type { NfcTag, NfcTagRequest, NfcTagStatus, NfcTagUpdateRequest } from '../types/nfcTag'
import { activateNfcTag, createNfcTag, deactivateNfcTag, listNfcTags, updateNfcTag } from '../api/nfcTags'

const STATUS_FILTERS: { value: NfcTagStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'ACTIVE', label: '활성' },
  { value: 'INACTIVE', label: '비활성' },
  { value: 'LOST', label: '분실' },
  { value: 'DAMAGED', label: '파손' },
]

interface TagFormState {
  name: string
  uid: string
  location: string
  description: string
}

const emptyForm: TagFormState = { name: '', uid: '', location: '', description: '' }

// 새 태그 등록할 때 UID를 직접 입력하기 번거로우니 임의로 하나 만들어서 채워줌(실제로는 하드웨어가 UID를 갖고 있음)
const generateUid = () =>
  Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, '0')
      .toUpperCase(),
  ).join(':')

const NfcTagsPage = () => {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<NfcTagStatus | 'ALL'>('ALL')
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<TagFormState>(emptyForm)

  // 상태 필터를 서버로도 실제 전달 (§9 "상태별 필터링"), 아래 filtered에서 한 번 더 걸러서 이중 안전망
  const tagsQuery = useQuery({
    queryKey: ['nfcTags', statusFilter],
    queryFn: () => listNfcTags(statusFilter === 'ALL' ? undefined : statusFilter),
  })
  const tags = tagsQuery.data ?? []

  const invalidateTags = () => queryClient.invalidateQueries({ queryKey: ['nfcTags'] })
  const createMutation = useMutation({ mutationFn: createNfcTag, onSuccess: invalidateTags })
  const updateMutation = useMutation({
    mutationFn: ({ id, req }: { id: number; req: NfcTagUpdateRequest }) => updateNfcTag(id, req),
    onSuccess: invalidateTags,
  })
  const activateMutation = useMutation({ mutationFn: activateNfcTag, onSuccess: invalidateTags })
  const deactivateMutation = useMutation({ mutationFn: deactivateNfcTag, onSuccess: invalidateTags })

  const filtered = useMemo(() => {
    return tags.filter((t) => statusFilter === 'ALL' || t.status === statusFilter)
  }, [tags, statusFilter])

  // 목업의 통계 카드 4개는 실제 태그 목록 기준으로 계산 (오늘 인식 횟수는 별도 API가 없어서 여전히 정적 값)
  const statCards = [
    { label: '전체 태그', value: `${tags.length}개` },
    { label: '활성 태그', value: `${tags.filter((t) => t.status === 'ACTIVE').length}개` },
    { label: '비활성 태그', value: `${tags.filter((t) => t.status !== 'ACTIVE').length}개` },
    { label: '오늘 인식 횟수', value: '24회' }, // TODO: 별도 통계 API 없음 - 필요해지면 백엔드에 요청
  ]

  // ACTIVE면 비활성화, 그 외(INACTIVE/LOST/DAMAGED)면 활성화 시도 - activate/deactivate API 2개만 있어서
  // LOST/DAMAGED에서 활성화가 실제로 허용되는지는 서버 쪽 비즈니스 규칙에 달림(TODO: 실제 테스트 필요)
  const toggleStatus = (tag: NfcTag) => {
    if (tag.status === 'ACTIVE') deactivateMutation.mutate(tag.id)
    else activateMutation.mutate(tag.id)
  }

  const openCreate = () => {
    setForm({ ...emptyForm, uid: generateUid() })
    setEditingId(null)
    setFormMode('create')
  }

  const openEdit = (tag: NfcTag) => {
    setForm({ name: tag.name, uid: tag.uid, location: tag.location, description: tag.description ?? '' })
    setEditingId(tag.id)
    setFormMode('edit')
  }

  const closeForm = () => setFormMode(null)

  const handleSubmitForm = (e: FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.uid.trim() || !form.location.trim()) return

    if (formMode === 'edit' && editingId !== null) {
      const req: NfcTagUpdateRequest = {
        uid: form.uid.trim(),
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        location: form.location.trim(),
      }
      updateMutation.mutate({ id: editingId, req })
    } else {
      const req: NfcTagRequest = {
        uid: form.uid.trim(),
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        location: form.location.trim(),
      }
      createMutation.mutate(req)
    }
    closeForm()
  }

  const muted = (value: string | null | undefined) => <span className="text-[#6b7280]">{value ?? '-'}</span>

  const columns: TableColumn<NfcTag>[] = [
    { key: 'name', header: '태그명', render: (row) => <span className="font-semibold">{row.name}</span> },
    {
      key: 'uid',
      header: 'UID',
      render: (row) => <span className="font-mono text-[12.5px] text-[#6b7280]">{row.uid}</span>,
    },
    { key: 'location', header: '설치 위치', render: (row) => muted(row.location) },
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
          <Button variant="secondary" size="sm" onClick={() => toggleStatus(row)}>
            {row.status === 'ACTIVE' ? '비활성화' : '활성화'}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      {/* ===== UI: 통계 카드 4개 (전체/활성/비활성 태그 수는 실제 값, 오늘 인식 횟수는 아직 정적 값) ===== */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.label}>
            <p className="text-xs font-medium text-[#8a8f98]">{card.label}</p>
            <p className="mt-1 text-[22px] font-bold text-[#1c1e21]">{card.value}</p>
          </Card>
        ))}
      </div>

      {/* ===== UI: 상태 필터(전체/활성/비활성/분실/파손) + 신규 태그 등록 버튼 ===== */}
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
      <Table
        columns={columns}
        data={filtered}
        rowKey={(row) => row.id}
        emptyMessage={tagsQuery.isLoading ? '불러오는 중...' : '조건에 맞는 태그가 없습니다.'}
      />

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
            <p className="mt-[5px] text-[11.5px] text-[#9aa1ac]">
              실제 태그에 새겨진 UID와 다르면 인식이 안 되니 정확히 입력하세요. (수정 시 UID 변경은 서버가 거절할 수도 있음)
            </p>
          </div>
          <Input
            label="설치 위치"
            placeholder="예: 공학관 303호"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-semibold text-[#4b5563]">설명 (선택)</label>
            <textarea
              rows={2}
              placeholder="메모를 입력하세요"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full resize-none rounded-lg border border-[#dcdfe4] bg-white px-3 py-2 font-sans text-[13px] text-[#1c1e21] placeholder:text-[#9aa1ac] focus:outline-none focus:ring-1 focus:ring-[oklch(55%_0.16_258)]"
            />
          </div>
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
