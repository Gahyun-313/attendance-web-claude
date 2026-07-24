// 설정 화면 - 조직 정보 + 출석 정책 두 섹션. 백엔드에 대응 API가 아직 없어서 MSW mock(src/mocks/handlers.ts)에
// 대고 동작함 - 실제 API가 생기면 api/settings.ts는 그대로 두고 mock 핸들러만 지우면 자동으로 실서버를 타게 됨
// 관리자 계정(비밀번호 변경 등) 설정은 대응하는 mock/백엔드 API 자체가 없어서 이번엔 포함 안 함(TODO)
import { useEffect, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getAttendancePolicy,
  getOrganizationSettings,
  updateAttendancePolicy,
  updateOrganizationSettings,
} from '../api/settings'
import type { AttendancePolicySettings, OrganizationSettings } from '../types/settings'
import { Button, Card, Input } from '../components'

const emptyOrgForm: OrganizationSettings = { organizationName: '', contactEmail: '' }
const emptyPolicyForm: AttendancePolicySettings = {
  autoAbsentProcessing: false,
  nfcLocationValidation: false,
  attendanceGraceMinutes: 0,
  lateThresholdMinutes: 0,
}

const SettingsPage = () => {
  const queryClient = useQueryClient()

  // ===== 조직 정보 =====
  const orgQuery = useQuery({ queryKey: ['settings', 'organization'], queryFn: getOrganizationSettings })
  const [orgForm, setOrgForm] = useState<OrganizationSettings>(emptyOrgForm)
  const [orgSaved, setOrgSaved] = useState(false)

  // 서버(mock) 값이 로드되면 폼 초기값으로 반영 - 사용자가 입력 중일 땐 refetch로 덮어써지지 않도록 최초 로드 시에만 동작
  useEffect(() => {
    if (orgQuery.data) setOrgForm(orgQuery.data)
  }, [orgQuery.data])

  const orgMutation = useMutation({
    mutationFn: updateOrganizationSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(['settings', 'organization'], data)
      setOrgSaved(true)
      setTimeout(() => setOrgSaved(false), 2000)
    },
  })

  const handleOrgSubmit = (e: FormEvent) => {
    e.preventDefault()
    orgMutation.mutate(orgForm)
  }

  // ===== 출석 정책 =====
  const policyQuery = useQuery({ queryKey: ['settings', 'attendance-policy'], queryFn: getAttendancePolicy })
  const [policyForm, setPolicyForm] = useState<AttendancePolicySettings>(emptyPolicyForm)
  const [policySaved, setPolicySaved] = useState(false)

  useEffect(() => {
    if (policyQuery.data) setPolicyForm(policyQuery.data)
  }, [policyQuery.data])

  const policyMutation = useMutation({
    mutationFn: updateAttendancePolicy,
    onSuccess: (data) => {
      queryClient.setQueryData(['settings', 'attendance-policy'], data)
      setPolicySaved(true)
      setTimeout(() => setPolicySaved(false), 2000)
    },
  })

  const handlePolicySubmit = (e: FormEvent) => {
    e.preventDefault()
    policyMutation.mutate(policyForm)
  }

  return (
    <div className="flex flex-col gap-[22px]">
      {/* ===== UI: 조직 정보 카드 ===== */}
      <Card title="조직 정보">
        {orgQuery.isLoading ? (
          <p className="text-sm text-gray-500">불러오는 중...</p>
        ) : (
          <form onSubmit={handleOrgSubmit} className="flex max-w-md flex-col gap-4">
            <Input
              label="단체명"
              value={orgForm.organizationName}
              onChange={(e) => setOrgForm((f) => ({ ...f, organizationName: e.target.value }))}
              required
            />
            <Input
              label="담당자 이메일"
              type="email"
              value={orgForm.contactEmail}
              onChange={(e) => setOrgForm((f) => ({ ...f, contactEmail: e.target.value }))}
              required
            />
            {/* ===== UI: 저장 버튼 + 상태 메시지 ===== */}
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={orgMutation.isPending}>
                {orgMutation.isPending ? '저장 중...' : '저장'}
              </Button>
              {orgSaved && <span className="text-sm text-[oklch(42%_0.13_152)]">저장됐어요</span>}
              {orgMutation.isError && <span className="text-sm text-red-600">저장에 실패했어요</span>}
            </div>
          </form>
        )}
      </Card>

      {/* ===== UI: 출석 정책 카드 ===== */}
      <Card title="출석 정책">
        {policyQuery.isLoading ? (
          <p className="text-sm text-gray-500">불러오는 중...</p>
        ) : (
          <form onSubmit={handlePolicySubmit} className="flex max-w-md flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="지각 기준(분)"
                type="number"
                min={0}
                value={policyForm.lateThresholdMinutes}
                onChange={(e) => setPolicyForm((f) => ({ ...f, lateThresholdMinutes: Number(e.target.value) }))}
              />
              <Input
                label="출석 인정 유예시간(분)"
                type="number"
                min={0}
                value={policyForm.attendanceGraceMinutes}
                onChange={(e) => setPolicyForm((f) => ({ ...f, attendanceGraceMinutes: Number(e.target.value) }))}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={policyForm.autoAbsentProcessing}
                onChange={(e) => setPolicyForm((f) => ({ ...f, autoAbsentProcessing: e.target.checked }))}
                className="size-4 rounded border-gray-300"
              />
              세션 종료 시 미출석자 자동 결석 처리
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={policyForm.nfcLocationValidation}
                onChange={(e) => setPolicyForm((f) => ({ ...f, nfcLocationValidation: e.target.checked }))}
                className="size-4 rounded border-gray-300"
              />
              NFC 태그 위치 검증 사용
            </label>
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={policyMutation.isPending}>
                {policyMutation.isPending ? '저장 중...' : '저장'}
              </Button>
              {policySaved && <span className="text-sm text-[oklch(42%_0.13_152)]">저장됐어요</span>}
              {policyMutation.isError && <span className="text-sm text-red-600">저장에 실패했어요</span>}
            </div>
          </form>
        )}
      </Card>

      <p className="text-xs text-gray-400">
        * 이 화면은 백엔드 설정 API가 아직 없어서 MSW로 mock 처리된 상태예요. 새로고침하면 저장한 값이 초기화됩니다 -
        실제 API가 준비되면 자동으로 연동됩니다.
      </p>
    </div>
  )
}

export default SettingsPage
