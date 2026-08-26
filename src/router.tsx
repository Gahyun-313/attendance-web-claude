import { createBrowserRouter } from 'react-router'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import SessionsPage from './pages/SessionsPage'
import AttendancePage from './pages/AttendancePage'
import GroupsPage from './pages/GroupsPage'
import UsersPage from './pages/UsersPage'
import NfcTagsPage from './pages/NfcTagsPage'
import StatisticsPage from './pages/StatisticsPage'
import NotificationsPage from './pages/NotificationsPage'
import SettingsPage from './pages/SettingsPage'

// 화면 구조: attendance-project-context.md §3 참고
// 로그인은 사이드바 없는 단독 화면이라 Layout 밖에 둠. 나머지는 Layout(사이드바+헤더) 하위 중첩 라우트
// handle.title은 Layout의 헤더 타이틀 표시에 사용 (useMatches로 읽음)
// TODO: 로그인 여부에 따른 보호 라우트(ProtectedRoute)는 아직 없음 - 필요해지면 추가
export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <DashboardPage />, handle: { title: '대시보드' } },
      { path: 'sessions', element: <SessionsPage />, handle: { title: '출석 세션 관리' } },
      { path: 'attendance', element: <AttendancePage />, handle: { title: '출석 현황' } },
      // 2026-08-26(STEP32) 신규 - BE 그룹 마스터 API(GET/POST/PUT/DELETE /api/groups) 추가로 생긴 화면
      { path: 'groups', element: <GroupsPage />, handle: { title: '그룹 관리' } },
      { path: 'users', element: <UsersPage />, handle: { title: '사용자 관리' } },
      { path: 'nfc-tags', element: <NfcTagsPage />, handle: { title: 'NFC 태그 관리' } },
      { path: 'statistics', element: <StatisticsPage />, handle: { title: '통계' } },
      { path: 'notifications', element: <NotificationsPage />, handle: { title: '알림 관리' } },
      { path: 'settings', element: <SettingsPage />, handle: { title: '설정' } },
    ],
  },
])
