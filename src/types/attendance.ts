// 2026-07-23(STEP19): 실제 출석 API 연동 반영. attendance-project-context.md §8(엔티티)/§9(API) 기준.
// AttendanceRecord 엔티티엔 userId/sessionId만 있고 이름/학번은 없음 - AttendanceResponse가 사용자 정보를
// 어떤 키로 채워서 내려주는지는 문서에 없어서 실제 키 이름은 api/attendances.ts의 매핑 함수에서만 다루도록 분리
export type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT' | 'WAITING'

export interface AttendanceRecord {
  id: number
  userId: number
  name: string // TODO: AttendanceResponse의 실제 필드명 미확인 - 응답 확인 후 api/attendances.ts 매핑만 수정하면 됨
  sid: string // 학번(=username) - 위와 동일
  group: string // TODO: 응답에 그룹명이 포함되는지 미확인
  status: AttendanceStatus
  time: string
  location: string
  modifier: string
  note: string
}

// 출석 상태 수정 요청 - "변경 시 사유 작성 필수"(§3)라 modifyReason이 필수 필드
export interface AttendanceStatusUpdateRequest {
  status: AttendanceStatus
  modifyReason: string
}

// 세션별 출석 대시보드 (targetCount 포함, §9 참고).
// §12 결정사항: 그룹 미지정 세션(targetCount=0)은 서버가 totalRecords로 근사해서 attendanceRate를 계산해준다고
// 명시돼있음 - 즉 출석률은 클라이언트가 presentCount/targetCount로 재계산하지 않고 서버가 내려주는 값을 그대로 씀
export interface AttendanceDashboardStats {
  targetCount: number
  totalRecords: number
  presentCount: number
  lateCount: number
  absentCount: number
  waitingCount: number
  attendanceRate: number
}
