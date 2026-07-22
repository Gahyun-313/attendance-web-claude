# 출석하자 (AttendHada) 어드민 웹

NFC 태그 기반 출석 관리 시스템의 관리자용 웹 대시보드. React + TypeScript + Vite로 구성.

## 시작하기

```bash
npm install
cp .env.example .env   # 필요 시 VITE_API_BASE_URL 값 확인 후 수정
npm run dev
```

## 기술 스택

- React 18 + TypeScript
- Vite
- Axios + React Query(TanStack Query) — 서버 상태 관리
- React Router — 라우팅
- STOMP (예정) — WebSocket 실시간 수신
- Chart.js (예정) — 통계 화면

## 폴더 구조

```
src/
  api/        axios 클라이언트, API 함수
  pages/      화면 단위 컴포넌트
  router.tsx  라우트 정의
  main.tsx    앱 엔트리 (QueryClientProvider, RouterProvider)
```
