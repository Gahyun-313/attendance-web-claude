// 그룹(Group) 마스터 타입. api-specification.md §9 "그룹(Group) API" 기준 (2026-08-25 BE 신규).
// User.groupName / Session.groupName은 여전히 단순 문자열 필드고 FK로 연결되지 않는다 - 이 Group은
// "존재하는 그룹명" 검증 기준(마스터 목록)일 뿐이다. architecture-and-flows.md §7 참고
export interface Group {
  id: number
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

// 그룹 생성/수정 요청 바디
export interface GroupRequest {
  name: string
  description?: string
}
