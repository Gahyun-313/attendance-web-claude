// 2026-07-23(STEP19): 실제 세션 API 연동 반영. attendance-project-context.md §8(엔티티)/§9(API) 기준.
// Session은 화면에서 쓰는 뷰 모델 - 실제 SessionResponse 필드는 2026-08-20 SessionResponse.java 소스로 전부
// 확정됨(title/description/groupName/sessionDate/startTime/endTime/lateThresholdMinutes/location/status/note는
// 기존 추정이 정확했음). 단 NFC 태그 정보는 nfcTagId/nfcTagName 평면 필드가 아니라 nfcTag(id/uid/name/location)
// 중첩 객체였음(버그, api/sessions.ts에서 수정) - 그 매핑만 담당하던 원칙은 계속 유지
export type SessionStatus = 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELED'

export interface Session {
  id: number
  name: string
  group: string
  date: string
  time: string
  tag: string
  rate: string // TODO: 세션 목록 API엔 출석률 필드가 없어서 항상 '-' - 상세 모달 열 때 출석 대시보드 API로 채우는 걸 다음 STEP에서 고려
  status: SessionStatus
  desc: string
  location: string
  lateThreshold: string
  note: string
  nfcTagId: number | null
}

// 세션 생성/수정 요청 바디 - SessionRequest DTO. 2026-08-05: api-specification.md(#8 수정본)로
// 필드 구성(nfcTagId 포함)이 실제로 맞다고 확정됨 (더 이상 추정 아님). 응답 쪽 nfcTag 표시 필드명만 아직 미확인
export interface SessionRequest {
  title: string
  description: string
  groupName: string
  sessionDate: string
  startTime: string
  endTime: string
  lateThresholdMinutes: number
  location: string
  nfcTagId: number
  note: string
}
