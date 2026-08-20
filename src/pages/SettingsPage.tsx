// 설정 화면. 2026-08-19(STEP29-5): BE 신규 API 공지로 실제 API(GET/PUT /api/organizations/me)로 전면 교체함.
// 예전엔 조직정보/출석정책이 MSW mock 기준 2개 카드로 나뉘어 있었는데, 실제 API는 하나로 통합돼있어서
// 단체 코드(읽기전용) + 단체명 + 출석 정책을 한 카드에 같이 둠. 담당자 이메일 필드는 실제 API에 없어서 제거함
// 2026-08-20(STEP30): "계정" 카드 신규 추가 - 로그인된 관리자 본인 비밀번호 변경(PATCH /api/users/me/password).
// STEP29-2의 로그아웃 상태 "비밀번호 재설정"(LoginPage)과는 별개 기능
import { useEffect, useState, type FormEvent } from 'react'
import axios from 'axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getOrganization, updateOrganization } from '../api/settings'
import { changePassword } from '../api/users'
import type { OrganizationSettings } from '../types/settings'
import type { ApiErrorResponse } from '../types/common'
import { Button, Card, Input } from '../components'

type OrgForm = Pick<
  OrganizationSettings,
  'name' | 'autoAbsentEnabled' | 'nfcLocationValidationEnabled' | 'defaultAttendanceGraceMinutes' | 'defaultLateThresholdMinutes'
>

const emptyForm: OrgForm = {
  name: '',
  autoAbsentEnabled: false,
  nfcLocationValidationEnabled: false,
  defaultAttendanceGraceMinutes: 0,
  defaultLateThresholdMinutes: 0,
}

const emptyPasswordForm = { currentPassword: '', newPassword: '', confirmPassword: '' }

// LoginPage.tsx의 extractError()와 같은 패턴 - 서버 에러 메시지(ApiErrorResponse.message)를 우선 보여줌
const extractError = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) return error.response?.data?.message ?? fallback
  return fallback
}

const SettingsPage = () => {
  const queryClient = useQueryClient()
  const orgQuery = useQuery({ queryKey: ['settings', 'organization'], queryFn: getOrganization })
  const [form, setForm] = useState<OrgForm>(emptyForm)
  const [saved, setSaved] = useState(false)

  // 서버 값이 로드되면 폼 초기값으로 반영 - 사용자가 입력 중일 땐 refetch로 덮어써지지 않도록 최초 로드 시에만 동작
  useEffect(() => {
    if (orgQuery.data) {
      const { name, autoAbsentEnabled, nfcLocationValidationEnabled, defaultAttendanceGraceMinutes, defaultLateThresholdMinutes } =
        orgQuery.data
      setForm({ name, autoAbsentEnabled, nfcLocationValidationEnabled, defaultAttendanceGraceMinutes, defaultLateThresholdMinutes })
    }
  }, [orgQuery.data])

  const mutation = useMutation({
    mutationFn: updateOrganization,
    onSuccess: (data) => {
      queryClient.setQueryData(['settings', 'organization'], data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    },
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    mutation.mutate(form)
  }

  // ===== 계정(비밀번호 변경) 카드 상태 - 단체 정보 폼과는 완전히 독립적인 별도 폼 =====
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSaved, setPasswordSaved] = useState(false)

  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      setPasswordForm(emptyPasswordForm)
      setPasswordSaved(true)
      setTimeout(() => setPasswordSaved(false), 2000)
    },
    onError: (error) => setPasswordError(extractError(error, '비밀번호 변경에 실패했어요')),
  })

  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('새 비밀번호가 일치하지 않아요')
      return
    }
    passwordMutation.mutate({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword })
  }

  return (
    <div className="flex flex-col gap-[22px]">
      {/* ===== UI: 단체 정보 + 출석 정책 통합 카드 (실제 GET/PUT /api/organizations/me) ===== */}
      <Card title="단체 정보 및 출석 정책">
        {orgQuery.isLoading ? (
          <p className="text-sm text-gray-500">불러오는 중...</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-4">
            {/* 단체 코드는 읽기전용 - PUT 요청에도 포함하지 않음 */}
            <div>
              <p className="mb-1 text-sm font-medium text-gray-700">단체 코드</p>
              <p className="text-sm text-[#4b5563]">{orgQuery.data?.code ?? '-'}</p>
            </div>
            <Input
              label="단체명"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="지각 기준(분)"
                type="number"
                min={0}
                value={form.defaultLateThresholdMinutes}
                onChange={(e) => setForm((f) => ({ ...f, defaultLateThresholdMinutes: Number(e.target.value) }))}
              />
              <Input
                label="출석 인정 유예시간(분)"
                type="number"
                min={0}
                value={form.defaultAttendanceGraceMinutes}
                onChange={(e) => setForm((f) => ({ ...f, defaultAttendanceGraceMinutes: Number(e.target.value) }))}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.autoAbsentEnabled}
                onChange={(e) => setForm((f) => ({ ...f, autoAbsentEnabled: e.target.checked }))}
                className="size-4 rounded border-gray-300"
              />
              세션 종료 시 미출석자 자동 결석 처리
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.nfcLocationValidationEnabled}
                onChange={(e) => setForm((f) => ({ ...f, nfcLocationValidationEnabled: e.target.checked }))}
                className="size-4 rounded border-gray-300"
              />
              NFC 태그 위치 검증 사용
            </label>
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? '저장 중...' : '저장'}
              </Button>
              {saved && <span className="text-sm text-[oklch(42%_0.13_152)]">저장됐어요</span>}
              {mutation.isError && <span className="text-sm text-red-600">저장에 실패했어요</span>}
            </div>
          </form>
        )}
      </Card>

      {/* ===== UI: 계정(비밀번호 변경) 카드 - 실제 PATCH /api/users/me/password (STEP30) ===== */}
      <Card title="계정">
        <form onSubmit={handlePasswordSubmit} className="flex max-w-md flex-col gap-4">
          <Input
            label="현재 비밀번호"
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))}
            required
          />
          <Input
            label="새 비밀번호"
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
            required
          />
          <Input
            label="새 비밀번호 확인"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))}
            required
          />
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={passwordMutation.isPending}>
              {passwordMutation.isPending ? '변경 중...' : '비밀번호 변경'}
            </Button>
            {passwordSaved && <span className="text-sm text-[oklch(42%_0.13_152)]">변경됐어요</span>}
            {passwordError && <span className="text-sm text-red-600">{passwordError}</span>}
          </div>
        </form>
      </Card>
    </div>
  )
}

export default SettingsPage
