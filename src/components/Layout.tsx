import { NavLink, Outlet, useMatches } from 'react-router'
import type { User } from '../types/user'

const NAV_ITEMS = [
  { to: '/', label: '대시보드', end: true },
  { to: '/sessions', label: '출석 세션 관리' },
  { to: '/attendance', label: '출석 현황' },
  { to: '/users', label: '사용자 관리' },
  { to: '/nfc-tags', label: 'NFC 태그 관리' },
  { to: '/statistics', label: '통계' },
  { to: '/notifications', label: '알림 관리' },
  { to: '/settings', label: '설정' }, // Claude Design 목업엔 없지만 원래 화면 목록(§3)에 있어서 유지
]

const getStoredUser = (): User | null => {
  const raw = localStorage.getItem('user')
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

// 어드민 콘솔 공통 셸(사이드바 + 헤더). 로그인 화면은 이 레이아웃 밖에서 별도 렌더링됨
const Layout = () => {
  const matches = useMatches()
  const title = (matches.at(-1)?.handle as { title?: string } | undefined)?.title ?? ''
  const user = getStoredUser()

  return (
    <div className="flex min-h-screen w-full bg-[#f5f6f8] text-[#1c1e21]">
      {/* ===== UI: 왼쪽 사이드바 (로고 + nav + 하단 버전 텍스트) ===== */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-[#e8e9ec] bg-white p-3.5">
        <div className="px-2.5 pb-6 pt-0.5">
          <div className="text-base font-bold tracking-tight text-[#1c1e21]">출석하자</div>
          <div className="mt-0.5 text-[11.5px] font-medium text-[#9aa1ac]">Admin Console</div>
        </div>

        {/* ===== UI: nav 메뉴 목록 - 화면 추가/이름 바꾸려면 위쪽 NAV_ITEMS 배열만 고치면 됨 ===== */}
        <nav className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `rounded-lg px-3.5 py-2.5 text-left text-[13.5px] ${
                  isActive
                    ? 'bg-[oklch(95%_0.03_258)] font-semibold text-[oklch(46%_0.16_258)]'
                    : 'font-medium text-[#5b6270] hover:bg-gray-50'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto px-2.5 py-3 text-[11px] font-medium text-[#c1c5cc]">v1.0 · Day 7 어드민 웹</div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* ===== UI: 상단 헤더 (왼쪽: 화면 제목, 오른쪽: 알림 아이콘 + 로그인한 관리자 정보) ===== */}
        <header className="flex h-[58px] shrink-0 items-center justify-between border-b border-[#e8e9ec] bg-white px-7">
          <div className="text-base font-bold text-[#1c1e21]">{title}</div>

          <div className="flex items-center gap-[18px]">
            {/* ===== UI: 알림 종 아이콘 - 오른쪽 위 빨간 점은 항상 표시(안 읽은 알림 개수 연동 전) ===== */}
            <div className="relative size-5 text-[#8a8f98]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.7 21a2 2 0 01-3.4 0" />
              </svg>
              <div className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-[oklch(58%_0.19_20)]" />
            </div>

            {/* ===== UI: 관리자 아바타(이름 첫 글자) + 이름/역할 ===== */}
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-full bg-[oklch(95%_0.03_258)] text-[12.5px] font-bold text-[oklch(46%_0.16_258)]">
                {user?.name?.[0] ?? 'A'}
              </div>
              <div>
                <div className="text-[13px] font-semibold text-[#1c1e21]">{user?.name ?? '관리자'}</div>
                <div className="text-[11px] text-[#9aa1ac]">{user?.role === 'ADMIN' ? '관리자' : (user?.role ?? '')}</div>
              </div>
            </div>
          </div>
        </header>

        {/* ===== UI: 본문 영역 - 여기 Outlet 자리에 각 화면(DashboardPage 등)이 렌더링됨 ===== */}
        {/* gap-[22px]가 각 화면 안의 섹션(필터바/카드/표 등) 사이 세로 간격을 자동으로 줌 */}
        <main className="flex flex-1 flex-col gap-[22px] overflow-y-auto px-[30px] py-[26px]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
