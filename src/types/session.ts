// 2026-07-23(STEP19): 실제 세션 API 연동 반영. attendance-project-context.md §8(엔티티)/§9(API) 기준.
// Session은 화면에서 쓰는 뷰 모델 - 실제 SessionResponse의 정확한 JSON 필드명(특히 nfcTag 참조 방식)은
// 문서에 없어서 api/sessions.ts의 매핑 함수 한 곳에서만 변환하도록 분리해둠 (실제 응답 보고 그 함수만 고치면 됨)
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

// 세션 생성/수정 요청 바디 - SessionRequest DTO 추정 (컨벤션상 toEntity() 메서드를 가진 Request 클래스)
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
