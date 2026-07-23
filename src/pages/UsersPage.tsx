// 사용자(학생 계정) 관리 화면. 계정 목록을 조회/검색/필터링하고, 신규 계정 생성 및 정보 수정을 할 수 있다.
// 여기서 다루는 StudentAccount는 관리자가 관리하는 "학생" 목록이고, 로그인한 관리자 본인 정보(User)와는 다른 도메인
// 2026-07-23(STEP19): 로컬 시드 데이터 대신 실제 백엔드 API 연동 (GET/POST/PUT /api/users, /groups).
// 누적 출석률/지각/결석 수는 User 엔티티에 없어서 사용자마다 GET /api/statistics/users/{id}를 병렬 호출해서 채움
// (사용자 확인된 방식 - 사용자 수가 많아지면 느려질 수 있어 나중에 목록 전용 통계 API가 생기면 교체 권장)
import { useMemo, useState, type FormEvent } from 'react'
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { Badge, Button, Card, Input, Modal, Select, Table } from '../components'
import type { TableColumn } from '../components'
import { userStatusMeta } from '../utils/badgeColors'
import { GROUPS } from '../utils/groups'
import type { StudentAccount } from '../types/student'
import { createUser, deactivateUser, listUserGroups, listUsers, updateUser } from '../api/users'
import { getUserStatistics } from '../api/statistics'

const STATUS_FILTERS = ['활성/비활성 전체', '활성', '비활성']

const emptyForm = { studentId: '', name: '', email: '', password: '', group: GROUPS[0], note: '' }

interface EditFormState {
  name: string
  email: string
  group: string
}

const UsersPage = () => {
  const queryClient = useQueryClient()
  const [groupFilter, setGroupFilter] = useState('전체 그룹')
  const [statusFilter, setStatusFilter] = useState(STATUS_FILTERS[0])
  const [search, setSearch] = useState('')
  const [showAddUser, setShowAddUser] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [detailId, setDetailId] = useState<number | null>(null)
  const [editId, setEditId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<EditFormState>({ name: '', email: '', group: GROUPS[0] })

  const usersQuery = useQuery({ queryKey: ['users'], queryFn: listUsers })
  const groupsQuery = useQuery({ queryKey: ['userGroups'], queryFn: listUserGroups })
  const baseUsers = usersQuery.data ?? []
  // 그룹 목록 API가 비어있거나 아직 안 왔으면 기존 정적 목록(GROUPS)을 폴백으로 사용
  const groupOptions = groupsQuery.data && groupsQuery.data.length > 0 ? groupsQuery.data : GROUPS
  const GROUP_FILTERS = ['전체 그룹', ...groupOptions]

  // 사용자마다 통계 API를 병렬로 호출해서 rate/lateCount/absentCount를 채움
  const statsQueries = useQueries({
    queries: baseUsers.map((u) => ({
      queryKey: ['userStats', u.id],
      queryFn: () => getUserStatistics(u.id),
    })),
  })
  const users: StudentAccount[] = baseUsers.map((u, i) => {
    const stats = statsQueries[i]?.data
    return stats
      ? { ...u, rate: Math.round(stats.attendanceRate), lateCount: stats.lateCount, absentCount: stats.absentCount }
      : u
  })

  const invalidateUsers = () => queryClient.invalidateQueries({ queryKey: ['users'] })
  const createMutation = useMutation({ mutationFn: createUser, onSuccess: invalidateUsers })
  const updateMutation = useMutation({
    mutationFn: ({ id, req }: { id: number; req: EditFormState }) =>
      updateUser(id, { name: req.name, email: req.email, groupName: req.group, active: true }),
    onSuccess: invalidateUsers,
  })
  const deactivateMutation = useMutation({ mutationFn: deactivateUser, onSuccess: invalidateUsers })

  // 그룹 + 활성상태 + 이름/학번(id) 검색 세 조건을 모두 만족하는 사용자만 표에 보여줌
  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesGroup = groupFilter === '전체 그룹' || u.group === groupFilter
      const matchesStatus =
        statusFilter === '활성/비활성 전체' || (statusFilter === '활성' ? u.active : !u.active)
      const q = search.trim()
      const matchesSearch = q === '' || u.name.includes(q) || u.studentId.includes(q)
      return matchesGroup && matchesStatus && matchesSearch
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, groupFilter, statusFilter, search])

  // 대시보드 상단 4개 통계 카드는 목업에서도 users 배열이 아니라 정적 값이라 그대로 둠
  // TODO: 실제로는 GET /api/users/dashboard로 교체 (지금은 §9 기준 미완료 상태라 MSW mock 사용중, main.tsx/handlers.ts 참고)
  const statCards = [
    { label: '전체 사용자', value: `${users.length}명` },
    { label: '활성 사용자', value: `${users.filter((u) => u.active).length}명` },
    { label: '평균 출석률', value: '87%' },
    { label: '이번 달 신규', value: '5명' },
  ]

  const muted = (value: string) => <span className="text-[#6b7280]">{value}</span>

  const columns: TableColumn<StudentAccount>[] = [
    { key: 'name', header: '이름', render: (row) => <span className="font-semibold">{row.name}</span> },
    { key: 'email', header: '이메일', render: (row) => muted(row.email) },
    { key: 'group', header: '그룹', render: (row) => muted(row.group) },
    { key: 'firstDate', header: '첫 출석일', render: (row) => muted(row.firstDate ?? '-') },
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
      render: (row) => (
        <div className="flex gap-1.5">
          <Button variant="secondary" size="sm" onClick={() => setDetailId(row.id)}>
            상세
          </Button>
          <Button variant="secondary" size="sm" onClick={() => openEdit(row)}>
            수정
          </Button>
          {row.active && (
            <Button variant="secondary" size="sm" onClick={() => deactivateMutation.mutate(row.id)}>
              비활성화
            </Button>
          )}
        </div>
      ),
    },
  ]

  const detailUser = users.find((u) => u.id === detailId) ?? null
  const editingUser = users.find((u) => u.id === editId) ?? null

  const openEdit = (user: StudentAccount) => {
    setEditForm({ name: user.name, email: user.email, group: user.group })
    setEditId(user.id)
  }
  const closeEdit = () => setEditId(null)

  const handleSaveEdit = (e: FormEvent) => {
    e.preventDefault()
    if (editId === null || !editForm.name.trim() || !editForm.email.trim()) return
    updateMutation.mutate({ id: editId, req: editForm })
    closeEdit()
  }

  const closeAddUser = () => {
    setShowAddUser(false)
    setForm(emptyForm)
  }

  const handleCreate = (e: FormEvent) => {
    e.preventDefault()
    if (!form.studentId.trim() || !form.name.trim() || !form.email.trim()) return
    createMutation.mutate({
      studentId: form.studentId.trim(),
      password: form.password,
      name: form.name.trim(),
      groupName: form.group,
      note: form.note.trim(),
    })
    closeAddUser()
  }

  return (
    <>
      {/* ===== UI: 통계 카드 4개 (전체/활성 사용자는 실제 값, 평균 출석률/이번 달 신규는 아직 정적 값) ===== */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.label}>
            <p className="text-xs font-medium text-[#8a8f98]">{card.label}</p>
            <p className="mt-1 text-[22px] font-bold text-[#1c1e21]">{card.value}</p>
          </Card>
        ))}
      </div>

      {/* ===== UI: 그룹/상태 필터 + 이름·학번 검색 + 신규 사용자 추가 버튼 ===== */}
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

      {/* ===== UI: 사용자 목록 표 ===== */}
      <Table
        columns={columns}
        data={filtered}
        rowKey={(row) => row.id}
        emptyMessage={usersQuery.isLoading ? '불러오는 중...' : '조건에 맞는 사용자가 없습니다.'}
      />

      {/* ===== UI: 신규 사용자 추가 모달 (Claude Design 목업에 실제 시안 있던 폼) ===== */}
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
            {groupOptions.map((g) => (
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

      {/* ===== UI: 사용자 상세 모달 - 목업엔 이 모달 시안이 없어서 세션 상세 모달과 같은 톤으로 직접 구성 ===== */}
      <Modal open={detailUser !== null} onClose={() => setDetailId(null)} title={detailUser?.name}>
        {detailUser && (
          <>
            <div className="-mt-2 mb-4">
              <Badge color={userStatusMeta(detailUser.active).color}>{userStatusMeta(detailUser.active).label}</Badge>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-y-2.5 text-[13px]">
              <span className="text-[#9aa1ac]">학번</span>
              <span className="font-medium text-[#1c1e21]">{detailUser.studentId}</span>
              <span className="text-[#9aa1ac]">이메일</span>
              <span className="font-medium text-[#1c1e21]">{detailUser.email}</span>
              <span className="text-[#9aa1ac]">그룹</span>
              <span className="font-medium text-[#1c1e21]">{detailUser.group}</span>
              <span className="text-[#9aa1ac]">첫 출석일</span>
              <span className="font-medium text-[#1c1e21]">{detailUser.firstDate ?? '-'}</span>
              <span className="text-[#9aa1ac]">누적 출석률</span>
              <span className="font-medium text-[#1c1e21]">{detailUser.rate}%</span>
              <span className="text-[#9aa1ac]">지각/결석</span>
              <span className="font-medium text-[#1c1e21]">
                {detailUser.lateCount} / {detailUser.absentCount}
              </span>
            </div>
          </>
        )}
      </Modal>

      {/* ===== UI: 사용자 수정 모달 - PUT /api/users/:id는 활성상태를 다루지 않는다고 보고 이름/이메일/그룹만 수정 가능하게 함
           (활성→비활성 전환은 위 액션의 "비활성화" 버튼, 즉 DELETE /api/users/:id(soft delete)로만 가능 - §9 참고) ===== */}
      <Modal open={editingUser !== null} onClose={closeEdit} title="사용자 수정">
        {editingUser && (
          <form onSubmit={handleSaveEdit} className="flex flex-col gap-3.5">
            <Input
              label="이름"
              value={editForm.name}
              onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
            <Input
              label="이메일"
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
            <Select
              label="그룹"
              value={editForm.group}
              onChange={(e) => setEditForm((f) => ({ ...f, group: e.target.value }))}
            >
              {groupOptions.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </Select>
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

export default UsersPage
