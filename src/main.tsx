// 앱 진입점(entry point). 순서: React Query 클라이언트 준비 → (개발 모드면) MSW mock 서버 시작 → 라우터로 화면 렌더링
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router'
import { router } from './router'
import './index.css'

// 서버 데이터 캐싱/재요청 정책 - 실패 시 1번만 재시도, 창 포커스 돌아와도 자동 재요청 안 함
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// 개발 모드에서만 MSW 활성화 (백엔드에 없는 API만 가로채고, 나머지는 실제 서버로 통과)
async function enableMocking() {
  if (!import.meta.env.DEV) return
  const { worker } = await import('./mocks/browser')
  return worker.start({ onUnhandledRequest: 'bypass' })
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  )
})
