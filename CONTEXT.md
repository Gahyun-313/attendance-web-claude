# 출석하자 어드민 웹 - CONTEXT

> 다른 채팅에서 이어서 작업할 때 이 문서를 먼저 참고. STEP 끝날 때마다 갱신.

## 프로젝트 개요

- 서비스: 출석하자 — NFC 태깅 기반 대학 강의 출석 관리 서비스
- 이 프로젝트의 역할: **관리자용 웹** — Spring Boot 백엔드(완성+AWS 배포됨)를 사용하는 어드민 대시보드
- 목적: **백엔드(Spring) 취업 포트폴리오용 관리자 화면**. 프론트엔드 자체는 취업 목표 아님 → 과설계 금지, 실무에서 적당히 쓰는 수준으로 빠르게 구현
- 다른 구성 요소: Android 앱(학생용, 별도 개발), Spring Boot 백엔드(`../attendance-project-context.md` 참고 — API 명세, 인증 방식 등)
- 백엔드 baseURL: `http://YOUR_EC2_PUBLIC_IP:8080/api` (EC2 IP, 인스턴스 재시작 시 바뀔 수 있음)
- 디자인: Figma 연동 (커넥터 인증 완료, 2026-07-23 기준)

## 진행 방식 (합의된 규칙)

- STEP 단위로 진행, 매 STEP: 작업목표 → 생성/수정 파일 → 코드 → 실행 방법 → 커밋 메시지 → 다음 STEP
- 과설계 금지: Redux/MobX/Clean Architecture/FSD/Atomic Design/Event Bus/DI Container 등 사용 안 함
- 폴더 구조는 단순하게: `api, components, hooks, pages, types, utils, styles, router, main.tsx` (필요시 `lib, assets, constants`)
- 전역 상태는 React Query로 충분한 한 만들지 않음. 필요해지면 그때 Zustand 도입
- 별도 `LEARNING_GUIDE.md`/`ARCHITECTURE.md`는 만들지 않고, 이 `CONTEXT.md`만 유지
- main 직접 push 금지: `main` → `develop` → `feat/...` 브랜치 → (원격 생기면 PR)
- 라이브러리 버전은 추측하지 않고 매번 검색해서 확인 (버전 변화가 빠름 — 2026-07-23 기준 검증된 버전은 아래 기술 스택 표 참고)

## 기술 스택 (버전은 2026-07-23 기준 검색으로 확인됨)

| 항목 | 선택 | 비고 |
|---|---|---|
| 빌드 | Vite 8 (8.0.9) | |
| 언어 | TypeScript 6 (6.0.3) | |
| UI | React 19 (19.2.8) | |
| 라우팅 | react-router 8 (8.3.0), **패키지명 `react-router`** (react-router-dom 아님) | Data Mode: createBrowserRouter + RouterProvider |
| 서버 상태 | @tanstack/react-query 5 (5.101.4) | |
| API 클라이언트 | axios (^1.18.x) | 2026-04 CVE(SSRF/메타데이터 유출) 패치된 1.15.1 이상만 사용 |
| Mock | msw 2 (2.15.0) | 백엔드에 아직 없는 API만 (예: 설정 API, 사용자 대시보드 API) |
| 스타일 | Tailwind CSS 4 (4.3.1), `@tailwindcss/vite` 플러그인 | v4는 tailwind.config.js/PostCSS 불필요 |
| 클라이언트 상태 | 미정, 필요시 Zustand | |
| 테스트 | Vitest (필요한 최소 수준만, 아직 미설치) | |
| 린트 | ESLint + Prettier (아직 미설치) | |

## 디자인 토큰 (Figma 확인, 2026-07-23)

Figma 시안(로그인/대시보드/출석현황/필터/학생계정 등) 기준. Tailwind 기본 팔레트와 값이 그대로 일치해서 커스텀 theme 설정 없이 기본 클래스만 사용.

| 용도 | 값 | Tailwind |
|---|---|---|
| 기본 텍스트 | #1f2937 | gray-800 |
| 보조 텍스트 | #6b7280 | gray-500 |
| placeholder | #9ca3af | gray-400 |
| input border | #d1d5db | gray-300 |
| 구분선/카드 border | #e5e7eb | gray-200 |
| 칩/배지 배경 | #f3f4f6 | gray-100 |
| 카드 옅은 배경 | #f9fafb | gray-50 |
| 버튼(primary) | #1f2937 | gray-800 (파란색 아님) |
| radius | input/select 4px, 버튼/카드 6px, 페이지 컨테이너 12px, 칩/아바타 999px | |
| 폰트 | 내부 화면은 Inter, **로그인 화면만 예외로 Pretendard** + 파란색(#2563eb) 그라디언트 히어로 | |

- 로그인 화면은 마케팅 성격의 히어로 레이아웃이라 내부 앱(회색톤)과 톤이 다름 — STEP5에서 그대로 반영 예정
- Figma에 "조퇴" 상태가 있는데 백엔드 AttendanceStatus(§8)에는 없음 — 출석현황 화면 만들 때 실제 API 값 확인 필요
- Figma MCP Starter 플랜 호출 한도에 걸려서 이후 화면들은 사용자가 준 PNG 스크린샷 기반으로 작업함

## 폴더 구조

```
src/
  api/          axios 클라이언트, 엔드포인트 함수
  components/   공통 컴포넌트 (Button, Input, Select, Badge, Card, Modal, Table, Pagination)
  hooks/        화면용 상태 로직
  pages/        화면 단위 컴포넌트
  types/        공유 TS 타입
  utils/        유틸 함수
  styles/       디자인 토큰 (Figma 연동 후 채움)
  router.tsx    라우트 정의
  main.tsx      앱 엔트리
```

## 화면 진행 상황

| 화면 | 상태 |
|---|---|
| 로그인 | 🟡 구현 완료, 실제 백엔드 연동 테스트 전 |
| 대시보드 | ⬜ placeholder만 |
| 출석 세션 관리 | ⬜ placeholder만 |
| 출석 현황 | ⬜ placeholder만 |
| 사용자 관리 | ⬜ placeholder만 |
| NFC 태그 관리 | ⬜ placeholder만 |
| 통계 | ⬜ placeholder만 |
| 알림 관리 | ⬜ placeholder만 |
| 설정 | ⬜ placeholder만 (백엔드 API도 미구현) |

## 진행 상황

- STEP 1 (2026-07-23, 완료): Vite+React+TS 프로젝트 셋업, axios 클라이언트(JWT 인터셉터 뼈대), React Query Provider, React Router 9개 화면 placeholder. 브랜치 `feature/day7-phase1-project-setup`
- STEP 2 (2026-07-23, 완료): React19/react-router 8 등 버전 최신화, Tailwind CSS v4 설치. 브랜치 `feat/step2-tech-stack-tailwind`
- STEP 3 (2026-07-23, 완료): 공통 API 타입(`ApiResponse<T>` 등) + auth API(login/logout/refresh), MSW로 없는 API 4종 mock(사용자 대시보드, 설정 API). 브랜치 `feat/step3-api-layer-msw`
  - 다른 도메인(세션/출석/사용자/NFC태그/통계/알림) api 함수는 전부 구현하지 않고, 해당 화면 STEP에서 그때그때 추가하기로 함(선구현 방지)
  - `ApiResponse<T>` 필드명(`success/data/message`)은 백엔드 소스 확인 없이 일반적인 Spring 래퍼 형태로 가정 — STEP5 로그인 연동 때 실제 응답 보고 검증 필요
- STEP 4 (2026-07-23, 완료): 공통 컴포넌트 8종(Button/Input/Select/Badge/Card/Modal/Table/Pagination) — Figma 디자인 컨텍스트(로그인/대시보드/출석현황목록/필터/학생계정생성) + 사용자 제공 PNG 14장 기반. 브랜치 `feat/step4-common-components`
  - Select는 Figma의 커스텀 드롭다운 대신 네이티브 `<select>` 사용(과설계 방지)
  - Modal은 Figma에 해당 화면이 없어 카드/버튼과 같은 톤으로 직접 구성
- STEP 5 (2026-07-23, 완료): 로그인 화면 구현. 브랜치 `feat/step5-login-page`
  - Button에 `brand`(파란색) variant 추가 — 로그인 히어로만 예외로 파란색 CTA 사용
  - Input의 `label`을 `string`에서 `ReactNode`로 넓혀서 아이콘+텍스트 라벨 지원
  - login({ username, password })에서 Figma의 "이메일" 입력값을 username으로 그대로 보냄 — 관리자 계정 username이 이메일 형태일 거라 가정, **실제 백엔드 연동 테스트 필요**
  - "로그인 유지" 체크박스는 UI만 존재, localStorage/sessionStorage 분기 로직은 아직 없음(TODO)
  - "비밀번호를 잊으셨나요?", "회원가입" 링크는 백엔드에 해당 API가 없어 비활성 처리
  - Tailwind v4.1+에서 `bg-gradient-to-br`가 제거되고 `bg-linear-to-br`로 이름이 바뀐 걸 검색으로 확인하고 반영 (안 그러면 그라디언트가 안 나왔을 것)

## 다음 작업

1. STEP 5 후속: 실제 백엔드(`http://YOUR_EC2_PUBLIC_IP:8080/api/auth/login`)로 로그인 테스트 — `ApiResponse<T>` 실제 형태, username이 이메일인지 확인
2. STEP 6~: 화면별 구현 (그때그때 필요한 api 함수 추가) — 대시보드부터 진행 예정

## 결정 사항 히스토리

- 2026-07-23: 웹은 포트폴리오 목적이 아니라 백엔드를 보여주기 위한 관리자 화면 → 계층 분리(service/mapper)·학습 콜아웃·연습과제 등 러닝가이드식 프로세스는 폐기, 단순한 STEP 진행 방식으로 확정
- 2026-07-23: `LEARNING_GUIDE.md`/`ARCHITECTURE.md`는 만들지 않고 `CONTEXT.md`만 유지하기로 결정 (다른 채팅에서 이어가기 위한 최소한의 문서)
- 2026-07-23: MSW는 전체 API가 아니라 백엔드에 아직 없는 API(설정 API, 사용자 대시보드 API)에 한해서만 사용
- 2026-07-23: react-router v7이 아니라 v8(현재 최신, `react-router` 패키지)로 확정 — 검색 결과 최신판이 이미 v8이었음
- 2026-07-23: STEP3에서 api 함수를 8개 도메인 전부 한 번에 만들지 않고 auth만 먼저 만들기로 함(로그인에 필요) — 나머지는 화면 없는 상태에서 미리 만드는 게 선구현(과설계)이라 판단, 해당 화면 STEP에서 추가
- 2026-07-23: MSW의 `public/mockServiceWorker.js`는 `npx msw init public/ --save` 명령으로 로컬에서 직접 생성해야 함 (버전별 정확한 스크립트라 손으로 안 만듦)
