// TODO: 백엔드 사용자 관리 API(GET/POST /api/users 등) 붙일 때 실제 응답 기준으로 재검증 필요
// 지금은 Claude Design 목업(Admin Web Page Mockups)의 사용자 관리 데이터 구조를 그대로 옮김
// 로그인한 관리자 본인 정보인 User(types/user.ts)와는 다른 도메인 - 여긴 관리자가 관리하는 학생 계정 목록
export interface StudentAccount {
  id: number
  name: string
  email: string
  group: string
  firstDate: string
  rate: number
  lateCount: number
  absentCount: number
  active: boolean
}
