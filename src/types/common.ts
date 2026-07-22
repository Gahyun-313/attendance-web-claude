// 백엔드 공통 응답 래퍼 (2026-07-23 실제 로그인 응답으로 검증 완료 - 더 이상 추정 아님)
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
