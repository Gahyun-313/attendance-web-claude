// 2026-07-23(STEP19): 실제 출석 API 연동 반영. attendance-project-context.md §8(엔티티)/§9(API) 기준.
// AttendanceRecord 엔티티엔 userId/sessionId만 있고 이름/학번은 없음 - AttendanceResponse가 사용자 정보를
// 어떤 키로 채워서 내려주는지는 2026-08-20 AttendanceResponse.java 소스로 전부 확정됨(userName/studentId/
// groupName/checkInTime/nfcLocation/modifiedBy/note까지 기존 추정이 전부 정확했음 - 버그 없음). 응답엔
// sessionId/nfcTagUid/modifyReason/createdAt/updatedAt도 있지만 화면에서 아직 안 써서 여기 타입엔 안 옮김
export type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT' | 'WAITING'

export interface AttendanceRecord {
  id: number
  userId: number
  name: string
  sid: string // 학번(=username)
  group: string
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

// 세션별 출석 대시보드. 2026-07-24 api-specification.md로 실제 필드명 확인됨:
// targetCount, totalRecords, present, late, absent, waiting, attendanceRate (presentCount 등이 아님)
// 그룹 미지정 세션(targetCount=0)은 서버가 totalRecords로 근사해서 attendanceRate를 계산해줌 - 클라이언트 재계산 안 함
export interface AttendanceDashboardStats {
  targetCount: number
  totalRecords: number
  present: number
  late: number
  absent: number
  waiting: number
  attendanceRate: number
}
