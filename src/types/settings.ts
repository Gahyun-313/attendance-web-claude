// 설정 화면 타입. 2026-08-19(STEP29-5): BE 신규 API 공지로 실제 API가 생겨서 전면 교체함
// (예전엔 MSW mock 기준으로 조직정보/출석정책 2개 엔드포인트로 나뉘어 있었는데, 실제 API는
// GET/PUT /api/organizations/me 하나로 통합돼있고 필드명도 다름 - contactEmail은 없고 대신 읽기전용 code가 있음)
export interface OrganizationSettings {
  id: number
  name: string
  code: string
  active: boolean
  autoAbsentEnabled: boolean
  nfcLocationValidationEnabled: boolean
  defaultAttendanceGraceMinutes: number
  defaultLateThresholdMinutes: number
  createdAt: string
  updatedAt: string
}

// PUT body는 전 필드 선택값 - 안 보낸 필드는 서버가 기존 값 그대로 유지함
export interface OrganizationUpdateRequest {
  name?: string
  autoAbsentEnabled?: boolean
  nfcLocationValidationEnabled?: boolean
  defaultAttendanceGraceMinutes?: number
  defaultLateThresholdMinutes?: number
}
