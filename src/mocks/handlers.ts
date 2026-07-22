import { http, HttpResponse } from 'msw'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

// 백엔드에 아직 없는 API만 mock 처리 (attendance-project-context.md §9 기준 ⬜ 표시된 것들)
// - GET /api/users/dashboard (사용자 대시보드)
// - 설정 API 4종 전체
// 나머지 도메인(세션/출석/사용자/NFC태그/통계/알림)은 실제 백엔드가 이미 동작하므로 mock하지 않음
export const handlers = [
  http.get(`${BASE_URL}/users/dashboard`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        totalUsers: 128,
        activeUsers: 120,
        averageAttendanceRate: 87.5,
        newUsersThisMonth: 6,
      },
      message: null,
    })
  }),

  http.get(`${BASE_URL}/settings/organization`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        organizationName: '출석하자',
        contactEmail: 'admin@attendhada.com',
      },
      message: null,
    })
  }),

  http.put(`${BASE_URL}/settings/organization`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({ success: true, data: body, message: null })
  }),

  http.get(`${BASE_URL}/settings/attendance-policy`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        autoAbsentProcessing: true,
        nfcLocationValidation: false,
        attendanceGraceMinutes: 10,
        lateThresholdMinutes: 15,
      },
      message: null,
    })
  }),

  http.put(`${BASE_URL}/settings/attendance-policy`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({ success: true, data: body, message: null })
  }),
]
