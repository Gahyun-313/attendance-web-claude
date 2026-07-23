// 알림 관리 화면. 2026-07-23(STEP19): 로컬 시드 데이터 대신 실제 백엔드 API 연동 (GET/POST /api/notifications,
// DELETE로 예약 취소). 목업에 있던 "발송 방식"(푸시/이메일) 필드는 실제 백엔드에 없어서 제거함(사용자 확인 완료) -
// 실제로는 FCM 토큰 존재 여부만 보고 즉시발송/예약 여부에 따라 SENT/FAILED/SCHEDULED가 결정됨
import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Badge, Button, Input, Modal, Select, Table } from '../components'
import type { TableColumn } from '../components'
import { notificationStatusMeta } from '../utils/badgeColors'
import { GROUPS } from '../utils/groups'
import type { NotificationItem, NotificationStatus } from '../types/notification'
import { cancelNotification, createNotification, listNotifications } from '../api/notifications'

// 목업엔 필터 탭이 전체/예약/발송완료/실패 4개뿐 (취소는 배지 색만 정의돼있고 탭은 없음) - 그대로 따름
const FILTER_TABS: { value: NotificationStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'SCHEDULED', label: '예약' },
  { value: 'SENT', label: '발송 완료' },
  { value: 'FAILED', label: '실패' },
]

const TARGET_OPTIONS = ['전체', ...GROUPS]

interface NotificationFormState {
  title: string
  content: string
  target: string
  scheduledAt: string
}

const emptyForm: NotificationFormState = { title: '', content: '', target: TARGET_OPTIONS[0], scheduledAt: '' }

const NotificationsPage = () => {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<NotificationStatus | 'ALL'>('ALL')
  const [detailId, setDetailId] = useState<number | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState<NotificationFormState>(emptyForm)

  const notificationsQuery = useQuery({
    queryKey: ['notifications', filter],
    queryFn: () => listNotifications(filter === 'ALL' ? undefined : filter),
  })
  const notifications = notificationsQuery.data ?? []

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  const createMutation = useMutation({ mutationFn: createNotification, onSuccess: invalidate })
  const cancelMutation = useMutation({ mutationFn: cancelNotification, onSuccess: invalidate })

  const detailNotification = notifications.find((n) => n.id === detailId) ?? null

  const closeCreate = () => {
    setShowCreate(false)
    setForm(emptyForm)
  }

  const handleCreate = (e: FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim()) return
    createMutation.mutate({
      title: form.title.trim(),
      content: form.content.trim(),
      targetGroup: form.target === '전체' ? null : form.target,
      scheduledAt: form.scheduledAt.trim() || null,
    })
    closeCreate()
  }

  const muted = (value: string) => <span className="text-[#6b7280]">{value}</span>

  const columns: TableColumn<NotificationItem>[] = [
    { key: 'title', header: '제목', render: (row) => <span className="font-semibold">{row.title}</span> },
    { key: 'target', header: '대상 그룹', render: (row) => muted(row.targetGroup ?? '전체') },
    {
      key: 'when',
      header: '예약/발송 시각',
      render: (row) => muted(row.sentAt ? `발송 ${row.sentAt}` : row.scheduledAt ? `예약 ${row.scheduledAt}` : '-'),
    },
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
          <Button variant="secondary" size="sm" onClick={() => cancelMutation.mutate(row.id)}>
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
      <Table
        columns={columns}
        data={notifications}
        rowKey={(row) => row.id}
        emptyMessage={notificationsQuery.isLoading ? '불러오는 중...' : '조건에 맞는 알림이 없습니다.'}
      />

      {/* ===== UI: 상세 모달 - 목업엔 이 모달 시안이 없어서 세션 상세 모달과 같은 톤으로 직접 구성 ===== */}
      <Modal open={detailNotification !== null} onClose={() => setDetailId(null)} title={detailNotification?.title}>
        {detailNotification && (
          <>
            <div className="-mt-2 mb-4">
              <Badge color={notificationStatusMeta[detailNotification.status].color}>
                {notificationStatusMeta[detailNotification.status].label}
              </Badge>
            </div>
            <p className="mb-[18px] text-[13px] leading-relaxed text-[#6b7280]">{detailNotification.content}</p>
            <div className="grid grid-cols-[100px_1fr] gap-y-2.5 text-[13px]">
              <span className="text-[#9aa1ac]">대상 그룹</span>
              <span className="font-medium text-[#1c1e21]">{detailNotification.targetGroup ?? '전체'}</span>
              <span className="text-[#9aa1ac]">예약 시각</span>
              <span className="font-medium text-[#1c1e21]">{detailNotification.scheduledAt ?? '-'}</span>
              <span className="text-[#9aa1ac]">발송 시각</span>
              <span className="font-medium text-[#1c1e21]">{detailNotification.sentAt ?? '-'}</span>
              <span className="text-[#9aa1ac]">발송 대상 수</span>
              <span className="font-medium text-[#1c1e21]">{detailNotification.targetCount ?? '-'}</span>
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
          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-semibold text-[#4b5563]">내용</label>
            <textarea
              rows={3}
              placeholder="알림 내용을 입력하세요"
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              required
              className="w-full resize-none rounded-lg border border-[#dcdfe4] bg-white px-3 py-2 font-sans text-[13px] text-[#1c1e21] placeholder:text-[#9aa1ac] focus:outline-none focus:ring-1 focus:ring-[oklch(55%_0.16_258)]"
            />
          </div>
          <Select label="대상 그룹" value={form.target} onChange={(e) => setForm((f) => ({ ...f, target: e.target.value }))}>
            {TARGET_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
          <div>
            <Input
              label="예약 시각 (선택)"
              placeholder="예: 2026-08-01 10:00"
              value={form.scheduledAt}
              onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
            />
            <p className="mt-[5px] text-[11.5px] text-[#9aa1ac]">
              비워두거나 과거 시각이면 즉시 발송, 미래 시각이면 예약 상태로 저장됩니다. (실제 예약 발송 스케줄러는 아직 없음 - §9)
            </p>
          </div>
          <div className="mt-1 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={closeCreate}>
              취소
            </Button>
            <Button type="submit">{form.scheduledAt.trim() ? '예약' : '즉시 발송'}</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}

export default NotificationsPage
