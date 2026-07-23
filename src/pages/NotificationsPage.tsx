import { useMemo, useState } from 'react'
import { Badge, Button, Table } from '../components'
import type { TableColumn } from '../components'
import { notificationStatusMeta } from '../utils/badgeColors'
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

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS)
  const [filter, setFilter] = useState<NotificationStatus | 'ALL'>('ALL')

  const filtered = useMemo(() => {
    return notifications.filter((n) => filter === 'ALL' || n.status === filter)
  }, [notifications, filter])

  const cancelScheduled = (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, status: 'CANCELED' } : n)))
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
          // TODO: 상세 모달은 목업에도 시안이 없어서(정적 버튼) UI만 유지
          <Button variant="secondary" size="sm">
            상세
          </Button>
        ),
    },
  ]

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {FILTER_TABS.map((tab) => (
            <Button key={tab.value} variant="chip" active={filter === tab.value} onClick={() => setFilter(tab.value)}>
              {tab.label}
            </Button>
          ))}
        </div>
        {/* TODO: 알림 생성 폼 시안이 목업에 없어서(정적 버튼) 실제 모달은 백엔드 API 설계 후 추가 */}
        <Button>+ 새 알림 생성</Button>
      </div>

      <Table
        columns={columns}
        data={filtered}
        rowKey={(row) => row.id}
        emptyMessage="조건에 맞는 알림이 없습니다."
      />
    </>
  )
}

export default NotificationsPage
