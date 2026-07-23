// 백엔드 목록 API 응답이 순수 배열이 아니라 Spring Data Page로 감싸져서 오는 경우가 있음(실제로 확인됨 - 2026-07-23,
// GET /api/nfc-tags 응답에 content/pageable/totalElements 등이 포함돼 있었음). 문서(§9)엔 사용자 목록만
// "페이징"이라고 적혀 있었지만 실제로는 다른 목록 API도 같은 방식일 수 있어서, 배열/Page 래퍼 둘 다 방어적으로 처리
import type { PageResponse } from '../types/common'

export const unwrapListPayload = <T>(payload: PageResponse<T> | T[]): T[] =>
  Array.isArray(payload) ? payload : payload.content
