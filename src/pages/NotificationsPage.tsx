import { useMemo, useState, type FormEvent } from 'react'
import { Badge, Button, Input, Modal, Select, Table } from '../components'
import type { TableColumn } from '../components'
import { notificationStatusMeta } from '../utils/badgeColors'
import { GROUPS } from '../utils/groups'
import type { NotificationItem, NotificationStatus } from '../types/notification'

// TODO: 지금은 Claude Design 목업(Admin Web Page Mockups)의 알림 관리 화면 시드 데이터를 그대로 씀.
// 실제 연동은 GET/POST /api/notifications 등 알림 API 붙일 때(다음 STEP) 교체
const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  { id: 1, title: '7/23 백엔드 프로젝트 회의 출석 안내', target: '개발1팀', method: '푸시', when: '발송 2026-07-23 09:30', status: 'SENT' },
  { id: 2, title: '지각 3회 이상 대상자 안내', target: '스터디 B조', method: '푸시', when: '예약 2026-07-24 09:00', status: 'SCHEDULED' },
  { id: 3, title: '여름방학 스터디 일정 변경 공지', target: '전체', method: '푸시 + 이메일', when: '발송 2026-07-20 08:00', status: 'SENT' },
  { id: 4, title: 'NFC 태그 점검 임시 안내', target: '스터디 C조', method: '푸시', when: '발송 2026-07-19 08:00', status: 'FAILED' },
  { id: 5, title: '8월 정기 모임 안내', target: 'CS스터디팀', method: '푸시', when: '예약 2026-08-01 10:00', status: 'SCHEDULED' },
]

// 목업엔 필터 탭이 전체/예약/발송완료/실패 4개뿐 (취소는 배지 색만 정의돼있고 탭은 없음) - 그대로 따름
const FILTER_TABS: { value: NotificationStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'SCHEDULED', label: '예약' },
  { value: 'SENT', label: '발송 완료' },
  { value: 'FAILED', label: '실패' },
]

const TARGET_OPTIONS = ['전체', ...GROUPS]
const METHOD_OPTIONS = ['푸시', '푸시 + 이메일']

interface NotificationFormState {
  title: string
  target: string
  method: string
  scheduleAt: string
}

const emptyForm: NotificationFormState = { title: '', target: TARGET_OPTIONS[0], method: METHOD_OPTIONS[0], scheduleAt: '' }

const formatNow = () => {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
}

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS)
  const [filter, setFilter] = useState<NotificationStatus | 'ALL'>('ALL')
  const [detailId, setDetailId] = useState<number | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState<NotificationFormState>(emptyForm)

  const filtered = useMemo(() => {
    return notifications.filter((n) => filter === 'ALL' || n.status === filter)
  }, [notifications, filter])

  const cancelScheduled = (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, status: 'CANCELED' } : n)))
  }

  const detailNotification = notifications.find((n) => n.id === detailId) ?? null

  const closeCreate = () => {
    setShowCreate(false)
    setForm(emptyForm)
  }

  const handleCreate = (e: FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    // TODO: 실제로는 POST /api/notifications로 보내고 응답값으로 대체 (실제 발송/예약은 백엔드가 처리)
    const scheduled = form.scheduleAt.trim() !== ''
    const newNotification: NotificationItem = {
      id: Date.now(),
      title: form.title.trim(),
      target: form.target,
      method: form.method,
      when: scheduled ? `예약 ${form.scheduleAt.trim()}` : `발송 ${formatNow()}`,
      status: scheduled ? 'SCHEDULED' : 'SENT',
    }
    setNotifications((prev) => [newNotification, ...prev])
    closeCreate()
  }

  const muted = (value: string) => <span className="text-[#6b7280]">{value}</span>

  const columns: TableColumn<NotificationItem>[] = [
    { key: 'title', header: '제목', render: (row) => <span className="font-semibold">{row.title}</span> },
    { key: 'target', header: '대상 그룹', render: (row) => muted(row.target) },
    { key: 'method', header: '발송 방식', render: (row) => muted(row.method) },
    { key: 'when', header: '예약/발송 시각', render: (row) => muted(row.when) },
    {
      key: 'status',
      header: '상태',
      render: (row) => {
        const meta = notificationStatusMeta[row.status]
        return <Badge color={meta.color}>{meta.label}</Badge>
      },
    },
    {
      key: 'actions',
      header: '액션',
      render: (row) =>
        row.status === 'SCHEDULED' ? (
          <Button variant="secondary" size="sm" onClick={() => cancelScheduled(row.id)}>
            발송 취소
          </Button>
        ) : (
          <Button variant="secondary" size="sm" onClick={() => setDetailId(row.id)}>
            상세
          </Button>
        ),
    },
  ]

  return (
    <>
      {/* ===== UI: 상태 필터 탭(칩) + 새 알림 생성 버튼 ===== */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {FILTER_TABS.map((tab) => (
            <Button key={tab.value} variant="chip" active={filter === tab.value} onClick={() => setFilter(tab.value)}>
              {tab.label}
            </Button>
          ))}
        </div>
        <Button onClick={() => setShowCreate(true)}>+ 새 알림 생성</Button>
      </div>

      {/* ===== UI: 알림 목록 표 (예약 상태면 "발송 취소", 그 외엔 "상세" 버튼) ===== */}
      <Table columns={columns} data={filtered} rowKey={(row) => row.id} emptyMessage="조건에 맞는 알림이 없습니다." />

      {/* ===== UI: 상세 모달 - 목업엔 이 모달 시안이 없어서 세션 상세 모달과 같은 톤으로 직접 구성 ===== */}
      <Modal open={detailNotification !== null} onClose={() => setDetailId(null)} title={detailNotification?.title}>
        {detailNotification && (
          <>
            <div className="-mt-2 mb-4">
              <Badge color={notificationStatusMeta[detailNotification.status].color}>
                {notificationStatusMeta[detailNotification.status].label}
              </Badge>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-y-2.5 text-[13px]">
              <span className="text-[#9aa1ac]">대상 그룹</span>
              <span className="font-medium text-[#1c1e21]">{detailNotification.target}</span>
              <span className="text-[#9aa1ac]">발송 방식</span>
              <span className="font-medium text-[#1c1e21]">{detailNotification.method}</span>
              <span className="text-[#9aa1ac]">예약/발송</span>
              <span className="font-medium text-[#1c1e21]">{detailNotification.when}</span>
            </div>
          </>
        )}
      </Modal>

      {/* ===== UI: 생성 폼 모달 - 목업엔 이 폼 시안이 없어서 직접 구성 (예약시각 비우면 즉시발송) ===== */}
      <Modal open={showCreate} onClose={closeCreate} title="새 알림 생성">
        <form onSubmit={handleCreate} className="flex flex-col gap-3.5">
          <Input
            label="제목"
            placeholder="예: 8월 정기 모임 안내"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
          <Select label="대상 그룹" value={form.target} onChange={(e) => setForm((f) => ({ ...f, target: e.target.value }))}>
            {TARGET_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
          <Select label="발송 방식" value={form.method} onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))}>
            {METHOD_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
          <div>
            <Input
              label="예약 시각 (선택)"
              placeholder="예: 2026-08-01 10:00"
              value={form.scheduleAt}
              onChange={(e) => setForm((f) => ({ ...f, scheduleAt: e.target.value }))}
            />
            <p className="mt-[5px] text-[11.5px] text-[#9aa1ac]">비워두면 즉시 발송으로 처리됩니다.</p>
          </div>
          <div className="mt-1 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={closeCreate}>
              취소
            </Button>
            <Button type="submit">{form.scheduleAt.trim() ? '예약' : '즉시 발송'}</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}

export default NotificationsPage
