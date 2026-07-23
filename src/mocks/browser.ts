// MSW(Mock Service Worker) 브라우저 워커 - 개발 모드에서만 main.tsx가 이걸 실행해서
// handlers.ts에 정의된 요청만 가로채 mock 응답을 주고, 나머지는 실제 백엔드로 그대로 통과시킴
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)
