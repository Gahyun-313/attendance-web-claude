// 2026-07-23(STEP19): 통계 API 연동용 타입. attendance-project-context.md §7/§9 기준
// - overall: 시간 흐름과 무관한 전체 누적 수치 (총 학생 수, 총 세션 수, 상태별 누적 건수)
// - dashboard: 오늘/최근/그룹별 관점의 요약·트렌드
// 2026-08-20: DashboardStatisticsResponse.java 실제 소스 확인 - 기존 추정과 다른 점이 있었음(둘 다 버그였음):
// ① todayAttendanceRate(추정) → 실제 필드는 recentAttendanceRate("최근 완료된 세션 5개의 평균 출석률", "오늘" 출석률이 아님)
// ② groupRates(추정) → 실제 필드명은 groupAttendanceRates. StatisticsPage가 groupRates를 읽고 있어서 이 필드가
//    지금까지 항상 undefined였음 - "그룹별 출석률" 카드가 실 연동된 것처럼 기록돼 있었지만 실제로는 데이터를
//    한 번도 못 받아온 상태였던 것으로 보임 (STEP30에서 수정)
// ③ activeUserCount는 이 DTO에 아예 없음(추정이 틀렸음) - 대응 API가 없다는 뜻이라 DashboardPage의
//    "활성 사용자"/"오늘 출석률" 카드는 채울 데이터가 없어 계속 '-'로 남겨둠
// GroupAttendanceRate 자체의 필드(groupName/attendanceRate)는 BE가 클래스명만 알려줘서 여전히 추정임

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

// 2026-08-20 BE DashboardStatisticsResponse.java 소스로 필드명 확정
// 2026-08-26(STEP37): 백엔드가 todayAttendanceRate 필드를 신규 추가(공지·api-specification.md로 필드명 확정) -
// "오늘" 세션들(ACTIVE+COMPLETED)만 실시간 집계한 진짜 "오늘 출석률". 기존 recentAttendanceRate(최근 완료
// 세션 5개 평균)는 그대로 유지 - 용도가 달라서 둘 다 씀.
// 상태분포(present/late/absent/waiting)/hourlyCheckInTrend 필드도 이번에 같이 추가됐다고 공지는 받았지만
// 정확한 JSON 필드명/구조가 아직 미확인(DashboardStatisticsResponse.java/HourlyCheckInCount.java 실 소스
// 필요) - 이 프로젝트에서 이런 식으로 추측하고 넘어갔다가 필드명이 틀려서 조용히 빈 데이터로 남았던 전례가
// 여러 번 있었어서(STEP30 groupRates 등) 여기 타입엔 아직 안 넣음. 확인되면 여기에 추가
export interface DashboardStatistics {
  todaySessionCount: number
  activeSessionCount: number
  recentAttendanceRate: number // 최근 완료된 세션 5개의 평균 출석률
  todayAttendanceRate: number // "오늘" sessionDate 기준 ACTIVE+COMPLETED 세션 실시간 집계 출석률 (STEP37)
  groupAttendanceRates: GroupAttendanceRate[] // 그룹별 누적 출석 현황 (완료된 세션 기준)
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
