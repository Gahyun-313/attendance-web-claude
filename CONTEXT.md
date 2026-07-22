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
| 로그인 | ⬜ placeholder만 |
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
- STEP 2 (진행 중): React19/react-router 8 등 버전 최신화, Tailwind CSS v4 설치

## 다음 작업

1. STEP 3: API 레이어 (types/ + api/ 함수) + 없는 API만 MSW
2. STEP 4: 공통 컴포넌트 (Button/Input/Select/Badge/Card/Modal/Table/Pagination) — Figma 시안 기반
3. STEP 5: 로그인 화면 (인증/토큰 저장)
4. STEP 6~: 화면별 구현

## 결정 사항 히스토리

- 2026-07-23: 웹은 포트폴리오 목적이 아니라 백엔드를 보여주기 위한 관리자 화면 → 계층 분리(service/mapper)·학습 콜아웃·연습과제 등 러닝가이드식 프로세스는 폐기, 단순한 STEP 진행 방식으로 확정
- 2026-07-23: `LEARNING_GUIDE.md`/`ARCHITECTURE.md`는 만들지 않고 `CONTEXT.md`만 유지하기로 결정 (다른 채팅에서 이어가기 위한 최소한의 문서)
- 2026-07-23: MSW는 전체 API가 아니라 백엔드에 아직 없는 API(설정 API, 사용자 대시보드 API)에 한해서만 사용
- 2026-07-23: react-router v7이 아니라 v8(현재 최신, `react-router` 패키지)로 확정 — 검색 결과 최신판이 이미 v8이었음
