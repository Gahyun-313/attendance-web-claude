import { useMemo, useState } from 'react'
import { Badge, Button, Card, Table } from '../components'
import type { TableColumn } from '../components'
import { nfcTagStatusMeta } from '../utils/badgeColors'
import type { NfcTag, NfcTagStatus } from '../types/nfcTag'

// TODO: 지금은 Claude Design 목업(Admin Web Page Mockups)의 NFC 태그 관리 화면 시드 데이터를 그대로 씀.
// 실제 연동은 GET/PATCH /api/nfc-tags 등 태그 API 붙일 때(다음 STEP) 교체
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

const NfcTagsPage = () => {
  const [tags, setTags] = useState<NfcTag[]>(INITIAL_TAGS)
  const [statusFilter, setStatusFilter] = useState<NfcTagStatus | 'ALL'>('ALL')

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
          {/* TODO: 태그 정보 수정은 아직 폼 시안이 없어서 UI만 (백엔드 API 붙을 때 같이 설계 필요) */}
          <Button variant="secondary" size="sm">
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
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.label}>
            <p className="text-xs font-medium text-[#8a8f98]">{card.label}</p>
            <p className="mt-1 text-[22px] font-bold text-[#1c1e21]">{card.value}</p>
          </Card>
        ))}
      </div>

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
        {/* TODO: 등록 폼 시안이 목업에 없어서(정적 버튼) 실제 등록 모달은 백엔드 API 설계 후 추가 */}
        <Button>+ 신규 태그 등록</Button>
      </div>

      <Table columns={columns} data={filtered} rowKey={(row) => row.id} emptyMessage="조건에 맞는 태그가 없습니다." />
    </>
  )
}

export default NfcTagsPage
