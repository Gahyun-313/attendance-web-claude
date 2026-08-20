import type { HttpHandler } from 'msw'

// 2026-08-19(STEP29-5): 여기 있던 mock 4종(GET /users/dashboard, GET/PUT /settings/organization,
// GET/PUT /settings/attendance-policy) 전부 BE 신규 API 공지로 실제 백엔드에 연동돼서 제거함.
// 지금은 mock이 필요한 API가 없지만, MSW 인프라(browser.ts/main.tsx의 DEV 조건부 worker.start())는
// 나중에 또 미구현 API가 생길 때 바로 쓸 수 있게 그대로 남겨둠
export const handlers: HttpHandler[] = []
