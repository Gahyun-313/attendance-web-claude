// 백엔드 공통 응답 래퍼 (Spring 쪽 global/response/ApiResponse.java 기준 추정)
// TODO: STEP5(로그인 연동)에서 실제 응답을 받아보고 필드명이 다르면 이 타입만 고치면 됨
// (api/ 함수들은 전부 이 타입을 거쳐서 data만 꺼내 쓰므로 파급 범위가 여기 한 곳으로 제한됨)
export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string | null
}

// 목록 API 페이징 응답 (Spring Data Page 기준 추정)
export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number // 현재 페이지 (0-base)
  size: number
}

// 에러 응답 (attendance-project-context.md §9 ErrorCode 표 참고: code는 A001, U001 같은 코드)
export interface ApiErrorResponse {
  code: string
  message: string
}
