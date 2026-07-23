// 2026-07-23(STEP19): 실제 사용자 관리 API 연동 반영. attendance-project-context.md §8(User 엔티티)/§9(API) 기준.
// 로그인한 관리자 본인 정보인 User(types/user.ts)와는 다른 도메인 - 여긴 관리자가 관리하는 학생 계정 목록
export interface StudentAccount {
  id: number
  name: string
  email: string
  studentId: string // = username (로그인 아이디)
  group: string
  firstDate: string | null
  // User 엔티티엔 이 3개 필드가 없음 - GET /api/statistics/users/{id}에서 따로 가져와 합침(api/users.ts 참고, 사용자 확인된 방식)
  rate: number
  lateCount: number
  absentCount: number
  active: boolean
}

// 신규 사용자(학생 계정) 생성 요청 - CreateUserRequest DTO 추정 (§3: 학번/비밀번호/이름/그룹/비고)
export interface CreateUserRequest {
  studentId: string // username으로 매핑
  password: string
  name: string
  groupName: string
  note?: string
}

// 사용자 정보 수정 요청 - UserUpdateRequest DTO 추정
export interface UserUpdateRequest {
  name: string
  email?: string
  groupName: string
  active: boolean
}
