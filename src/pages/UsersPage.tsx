import { useMemo, useState, type FormEvent } from 'react'
import { Badge, Button, Card, Input, Modal, Select, Table } from '../components'
import type { TableColumn } from '../components'
import { userStatusMeta } from '../utils/badgeColors'
import type { StudentAccount } from '../types/student'

// TODO: 지금은 Claude Design 목업(Admin Web Page Mockups)의 사용자 관리 화면 시드 데이터를 그대로 씀.
// 실제 연동은 GET/POST /api/users 등 사용자 API 붙일 때(다음 STEP) 교체
const INITIAL_USERS: StudentAccount[] = [
  { id: 1, name: '이서준', email: 'dev.seojun@example.com', group: '개발1팀', firstDate: '2026-03-04', rate: 96, lateCount: 2, absentCount: 1, active: true },
  { id: 2, name: '박지훈', email: 'jihoon.p@example.com', group: '개발1팀', firstDate: '2026-03-04', rate: 91, lateCount: 4, absentCount: 2, active: true },
  { id: 3, name: '김민준', email: 'minjun.k@example.com', group: '개발1팀', firstDate: '2026-03-11', rate: 88, lateCount: 3, absentCount: 3, active: true },
  { id: 4, name: '최수아', email: 'sooa.choi@example.com', group: '스터디 A조', firstDate: '2026-04-02', rate: 100, lateCount: 0, absentCount: 0, active: true },
  { id: 5, name: '정예은', email: 'yeeun.j@example.com', group: '스터디 B조', firstDate: '2026-04-09', rate: 79, lateCount: 6, absentCount: 3, active: true },
  { id: 6, name: '강도현', email: 'dohyun.k@example.com', group: '스터디 C조', firstDate: '2026-04-15', rate: 62, lateCount: 5, absentCount: 8, active: false },
  { id: 7, name: '윤서아', email: 'seoa.yoon@example.com', group: 'CS스터디팀', firstDate: '2026-05-02', rate: 94, lateCount: 1, absentCount: 1, active: true },
  { id: 8, name: '오하준', email: 'hajun.oh@example.com', group: '개발1팀', firstDate: '2026-05-20', rate: 85, lateCount: 3, absentCount: 2, active: true },
]

const GROUPS = ['개발1팀', '스터디 A조', '스터디 B조', '스터디 C조', 'CS스터디팀']
const GROUP_FILTERS = ['전체 그룹', ...GROUPS]
const STATUS_FILTERS = ['활성/비활성 전체', '활성', '비활성']

const emptyForm = { studentId: '', name: '', email: '', password: '', group: GROUPS[0], note: '' }

const UsersPage = () => {
  const [users, setUsers] = useState<StudentAccount[]>(INITIAL_USERS)
  const [groupFilter, setGroupFilter] = useState(GROUP_FILTERS[0])
  const [statusFilter, setStatusFilter] = useState(STATUS_FILTERS[0])
  const [search, setSearch] = useState('')
  const [showAddUser, setShowAddUser] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesGroup = groupFilter === '전체 그룹' || u.group === groupFilter
      const matchesStatus =
        statusFilter === '활성/비활성 전체' || (statusFilter === '활성' ? u.active : !u.active)
      const q = search.trim()
      const matchesSearch = q === '' || u.name.includes(q) || String(u.id).includes(q)
      return matchesGroup && matchesStatus && matchesSearch
    })
  }, [users, groupFilter, statusFilter, search])

  // 대시보드 상단 4개 통계 카드는 목업에서도 users 배열이 아니라 정적 값이라 그대로 둠
  const statCards = [
    { label: '전체 사용자', value: '42명' },
    { label: '활성 사용자', value: '39명' },
    { label: '평균 출석률', value: '87%' },
    { label: '이번 달 신규', value: '5명' },
  ]

  const muted = (value: string) => <span className="text-[#6b7280]">{value}</span>

  const columns: TableColumn<StudentAccount>[] = [
    { key: 'name', header: '이름', render: (row) => <span className="font-semibold">{row.name}</span> },
    { key: 'email', header: '이메일', render: (row) => muted(row.email) },
    { key: 'group', header: '그룹', render: (row) => muted(row.group) },
    { key: 'firstDate', header: '첫 출석일', render: (row) => muted(row.firstDate) },
    { key: 'rate', header: '누적 출석률', render: (row) => `${row.rate}%` },
    { key: 'lateAbsent', header: '지각/결석', render: (row) => muted(`${row.lateCount} / ${row.absentCount}`) },
    {
      key: 'status',
      header: '상태',
      render: (row) => {
        const meta = userStatusMeta(row.active)
        return <Badge color={meta.color}>{meta.label}</Badge>
      },
    },
    {
      key: 'actions',
      header: '액션',
      // TODO: 상세/수정은 백엔드 사용자 API 붙을 때 실제 동작 연결
      render: () => (
        <div className="flex gap-1.5">
          <Button variant="secondary" size="sm">
            상세
          </Button>
          <Button variant="secondary" size="sm">
            수정
          </Button>
        </div>
      ),
    },
  ]

  const closeAddUser = () => {
    setShowAddUser(false)
    setForm(emptyForm)
  }

  const handleCreate = (e: FormEvent) => {
    e.preventDefault()
    if (!form.studentId.trim() || !form.name.trim() || !form.email.trim()) return
    // TODO: 실제로는 POST /api/users로 보내고 응답으로 받은 값을 써야 함 - 지금은 클라이언트에만 추가
    const newUser: StudentAccount = {
      id: Date.now(),
      name: form.name.trim(),
      email: form.email.trim(),
      group: form.group,
      firstDate: new Date().toISOString().slice(0, 10),
      rate: 0,
      lateCount: 0,
      absentCount: 0,
      active: true,
    }
    setUsers((prev) => [newUser, ...prev])
    closeAddUser()
  }

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
        <div className="flex gap-2.5">
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="rounded-lg border border-[#dcdfe4] bg-white px-3 py-[7px] text-[13px] text-[#333]"
          >
            {GROUP_FILTERS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-[#dcdfe4] bg-white px-3 py-[7px] text-[13px] text-[#333]"
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="이름·학번 검색"
            className="w-[200px] rounded-lg border border-[#dcdfe4] bg-white px-3 py-[7px] text-[13px] text-[#333] placeholder:text-[#9aa1ac]"
          />
        </div>
        <Button onClick={() => setShowAddUser(true)}>+ 신규 사용자 추가</Button>
      </div>

      <Table columns={columns} data={filtered} rowKey={(row) => row.id} emptyMessage="조건에 맞는 사용자가 없습니다." />

      <Modal open={showAddUser} onClose={closeAddUser} title="신규 사용자 추가">
        <p className="-mt-2 mb-[18px] text-[12.5px] text-[#8a8f98]">
          관리자가 학생 계정을 생성합니다. 역할은 항상 STUDENT로 고정됩니다.
        </p>
        <form onSubmit={handleCreate} className="flex flex-col gap-3.5">
          <Input
            label="학번 (아이디)"
            placeholder="예: 20261234"
            value={form.studentId}
            onChange={(e) => setForm((f) => ({ ...f, studentId: e.target.value }))}
            required
          />
          <Input
            label="이름"
            placeholder="예: 한지민"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <Input
            label="이메일"
            type="email"
            placeholder="예: jimin.han@example.com"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
          />
          <div>
            <Input
              label="초기 비밀번호"
              placeholder="임시 비밀번호 입력"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
            <p className="mt-[5px] text-[11.5px] text-[#9aa1ac]">학생은 최초 로그인 후 비밀번호 변경이 권장됩니다.</p>
          </div>
          <Select label="그룹" value={form.group} onChange={(e) => setForm((f) => ({ ...f, group: e.target.value }))}>
            {GROUPS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </Select>
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
            <Button type="button" variant="secondary" onClick={closeAddUser}>
              취소
            </Button>
            <Button type="submit">계정 생성</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}

export default UsersPage
