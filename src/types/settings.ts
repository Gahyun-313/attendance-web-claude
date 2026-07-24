// 설정 화면 타입 - 백엔드에 아직 대응 API가 없어서 MSW mock 응답(src/mocks/handlers.ts) 모양 기준으로 잡음.
// 실제 백엔드 API가 생기면 이 타입이 실제 응답과 맞는지 다시 확인 필요
export interface OrganizationSettings {
  organizationName: string
  contactEmail: string
}

export interface AttendancePolicySettings {
  autoAbsentProcessing: boolean
  nfcLocationValidation: boolean
  attendanceGraceMinutes: number
  lateThresholdMinutes: number
}
