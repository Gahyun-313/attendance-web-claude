// 2026-07-23(STEP19): 통계 API 연동용 타입. attendance-project-context.md §7/§9 기준
// - overall: 시간 흐름과 무관한 전체 누적 수치 (총 학생 수, 총 세션 수, 상태별 누적 건수)
// - dashboard: 오늘/최근/그룹별 관점의 요약·트렌드 (오늘 세션 수, 최근 완료 세션 평균 출석률, 그룹별 출석률)
// DTO 필드명은 파일 목록(OverallStatisticsResponse/DashboardStatisticsResponse/GroupAttendanceRate)만
// 확인됐고 필드 단위 상세는 문서에 없어서 §3 화면 정의 기준으로 합리적으로 추정 - 실제 응답 보고 조정 필요

export interface OverallStatistics {
  totalUsers: number
  totalSessions: number
  overallAttendanceRate: number
  presentCount: number
  lateCount: number
  absentCount: number
}

export interface GroupAttendanceRate {
  groupName: string
  attendanceRate: number
}

export interface DashboardStatistics {
  todaySessionCount: number
  activeSessionCount: number
  todayAttendanceRate: number
  activeUserCount: number
  groupRates: GroupAttendanceRate[]
}

// 2026-08-18 BE 신규 API 공지로 확인됨(추정 아님). totalRecords=0(출석기록 없음)인 학생은
// 서버가 top/bottom 양쪽에서 이미 제외해서 내려줌
export interface AttendanceRankingEntry {
  userId: number
  name: string
  groupName: string
  attendanceRate: number
  totalRecords: number
}

export interface AttendanceRanking {
  topRanking: AttendanceRankingEntry[]
  bottomRanking: AttendanceRankingEntry[]
}
