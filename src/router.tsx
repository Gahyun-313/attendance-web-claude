import { createBrowserRouter } from 'react-router'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import SessionsPage from './pages/SessionsPage'
import AttendancePage from './pages/AttendancePage'
import UsersPage from './pages/UsersPage'
import NfcTagsPage from './pages/NfcTagsPage'
import StatisticsPage from './pages/StatisticsPage'
import NotificationsPage from './pages/NotificationsPage'
import SettingsPage from './pages/SettingsPage'

// 화면 구조: attendance-project-context.md §3 참고
// TODO: 로그인 여부에 따른 보호 라우트(ProtectedRoute)는 로그인 화면 작업 시 추가
export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/', element: <DashboardPage /> },
  { path: '/sessions', element: <SessionsPage /> },
  { path: '/attendance', element: <AttendancePage /> },
  { path: '/users', element: <UsersPage /> },
  { path: '/nfc-tags', element: <NfcTagsPage /> },
  { path: '/statistics', element: <StatisticsPage /> },
  { path: '/notifications', element: <NotificationsPage /> },
  { path: '/settings', element: <SettingsPage /> },
])
