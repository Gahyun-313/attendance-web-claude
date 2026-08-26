// 그룹 관리 화면. 그룹 마스터(Group)를 조회/생성/수정/삭제한다. 2026-08-26(STEP32) 신규 - BE가
// api-specification.md §9로 그룹 마스터 CRUD(GET/POST/PUT/DELETE /api/groups)를 새로 구현하면서 추가된 화면.
// 이 화면이 생기기 전까진 "그룹"이라는 게 학생 계정의 groupName 문자열 값 중 중복 제거한 목록뿐이라
// 처음 보는 그룹을 만들 방법 자체가 없었음 - 이 화면이 그 부트스트랩 문제를 해결한다.
// 세션/사용자 생성·수정 시 groupName이 여기 등록된 이름이 아니면 서버가 G001로 거부한다.
import { useState, type FormEvent } from 'react'
import axios from 'axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, Card, Input, Modal, Table } from '../components'
import type { TableColumn } from '../components'
import { createGroup, deleteGroup, listGroups, updateGroup } from '../api/groups'
import type { Group, GroupRequest } from '../types/group'
import type { ApiErrorResponse } from '../types/common'

interface GroupFormState {
  name: string
  description: string
}

const emptyForm: GroupFormState = { name: '', description: '' }

// SessionsPage.tsx/SettingsPage.tsx의 extractError()와 같은 패턴
const extractError = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) return error.response?.data?.message ?? fallback
  return fallback
}

const GroupsPage = () => {
  const queryClient = useQueryClient()
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<GroupFormState>(emptyForm)
  const [formError, setFormError] = useState<string | null>(null)

  const groupsQuery = useQuery({ queryKey: ['groups'], queryFn: listGroups })
  const groups = groupsQuery.data ?? []

  const invalidateGroups = () => queryClient.invalidateQueries({ queryKey: ['groups'] })

  const createMutation = useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      invalidateGroups()
      closeForm()
    },
    onError: (error) => setFormError(extractError(error, '그룹 생성에 실패했어요')),
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, req }: { id: number; req: GroupRequest }) => updateGroup(id, req),
    onSuccess: () => {
      invalidateGroups()
      closeForm()
    },
    onError: (error) => setFormError(extractError(error, '그룹 수정에 실패했어요')),
  })
  // 그룹 삭제는 목록/수정처럼 폼이 없어서 별도 성공/실패 표시 없이 invalidate만 - 실패하면 그냥 목록에 남아있는 걸로 알 수 있음
  const deleteMutation = useMutation({ mutationFn: deleteGroup, onSuccess: invalidateGroups })

  const openCreate = () => {
    setForm(emptyForm)
    setEditingId(null)
    setFormError(null)
    setFormMode('create')
  }

  const openEdit = (group: Group) => {
    setForm({ name: group.name, description: group.description ?? '' })
    setEditingId(group.id)
    setFormError(null)
    setFormMode('edit')
  }

  const closeForm = () => {
    setFormMode(null)
    setFormError(null)
  }

  const handleSubmitForm = (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (!form.name.trim()) return

    const req: GroupRequest = { name: form.name.trim(), description: form.description.trim() || undefined }

    if (formMode === 'edit' && editingId !== null) {
      updateMutation.mutate({ id: editingId, req })
    } else {
      createMutation.mutate(req)
    }
  }

  // 삭제는 영구 삭제라 되돌릴 수 없음 - 실제 백엔드 동작(소속 사용자/세션은 안 막고 groupName만 null로 초기화)을
  // 그대로 안내 문구에 넣어서 확인받음
  const handleDelete = (group: Group) => {
    const ok = window.confirm(
      `"${group.name}" 그룹을 삭제할까요?\n이 그룹을 쓰던 학생/세션은 삭제되지 않고, 그룹 소속만 빈 값으로 초기화됩니다.`,
    )
    if (ok) deleteMutation.mutate(group.id)
  }

  const muted = (value: string | null | undefined) => <span className="text-[#6b7280]">{value ?? '-'}</span>

  const columns: TableColumn<Group>[] = [
    { key: 'name', header: '그룹명', render: (row) => <span className="font-semibold">{row.name}</span> },
    { key: 'description', header: '설명', render: (row) => muted(row.description) },
    {
      key: 'actions',
      header: '액션',
      render: (row) => (
        <div className="flex gap-1.5">
          <Button variant="secondary" size="sm" onClick={() => openEdit(row)}>
            수정
          </Button>
          <Button variant="secondary" size="sm" className="text-red-600" onClick={() => handleDelete(row)}>
            삭제
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      {/* ===== UI: 전체 그룹 수 카드 - 다른 화면 상단 통계 카드와 톤 맞춤 ===== */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <p className="text-xs font-medium text-[#8a8f98]">전체 그룹</p>
          <p className="mt-1 text-[22px] font-bold text-[#1c1e21]">{groups.length}개</p>
        </Card>
      </div>

      {/* ===== UI: 새 그룹 추가 버튼 ===== */}
      <div className="flex items-center justify-end">
        <Button onClick={openCreate}>+ 새 그룹 추가</Button>
      </div>

      {/* ===== UI: 그룹 목록 표 ===== */}
      <Table
        columns={columns}
        data={groups}
        rowKey={(row) => row.id}
        emptyMessage={groupsQuery.isLoading ? '불러오는 중...' : '등록된 그룹이 없습니다. 새 그룹을 추가해주세요.'}
      />

      {/* ===== UI: 생성/수정 폼 모달 ===== */}
      <Modal open={formMode !== null} onClose={closeForm} title={formMode === 'edit' ? '그룹 수정' : '새 그룹 추가'}>
        <form onSubmit={handleSubmitForm} className="flex flex-col gap-3.5">
          <Input
            label="그룹명"
            placeholder="예: 스터디 A조"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
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
          <div className="mt-1 flex items-center justify-end gap-2">
            {formError && <span className="mr-auto text-[12.5px] text-red-600">{formError}</span>}
            <Button type="button" variant="secondary" onClick={closeForm}>
              취소
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {formMode === 'edit' ? '저장' : '추가'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}

export default GroupsPage
