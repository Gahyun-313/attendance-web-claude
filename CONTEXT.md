# 출석하자 어드민 웹 - CONTEXT

> 다른 채팅에서 이어서 작업할 때 이 문서를 먼저 참고. STEP 끝날 때마다 갱신.

## 프로젝트 개요

- 서비스: 출석하자 — NFC 태깅 기반 대학 강의 출석 관리 서비스
- 이 프로젝트의 역할: **관리자용 웹** — Spring Boot 백엔드(완성+AWS 배포됨)를 사용하는 어드민 대시보드
- 목적: **백엔드(Spring) 취업 포트폴리오용 관리자 화면**. 프론트엔드 자체는 취업 목표 아님 → 과설계 금지, 실무에서 적당히 쓰는 수준으로 빠르게 구현
- 다른 구성 요소: Android 앱(학생용, 별도 개발), Spring Boot 백엔드(`../attendance-project-context.md` 참고 — API 명세, 인증 방식 등)
- 백엔드 baseURL: `http://YOUR_EC2_PUBLIC_IP:8080/api` (EC2 IP, 인스턴스 재시작 시 바뀔 수 있음, 실제 값은 로컬 .env 참고)
- 디자인: 로그인 화면은 Figma, 나머지 7개 화면은 Claude Design 목업(`Admin Web Page Mockups.html`)이 기준 (§디자인 토큰 참고)

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

## 디자인 토큰 (2026-07-23, Claude Design 목업이 최종 기준)

**중요**: 최초엔 Figma 시안(로그인/대시보드/출석현황/필터/학생계정 등, 회색톤·gray-800 primary)을 기준으로 삼았었는데,
이후 사용자가 준 Claude Design 목업(`Admin Web Page Mockups.html`, 인터랙티브 프로토타입 — 실제 상태값/색상 로직이 JS로 들어있음)이
훨씬 상세하고 화면 7개(대시보드/세션관리/출석현황/사용자관리/NFC관리/통계/알림관리)를 전부 커버해서 **이걸 최종 기준으로 교체함**.
Figma는 로그인 화면(파란 히어로+Pretendard 폰트)에만 여전히 유효.

| 용도 | 값 |
|---|---|
| 페이지 배경 | `#f5f6f8` |
| 기본 텍스트 | `#1c1e21` |
| 보조 텍스트 | `#8a8f98` |
| 3차 텍스트(축 라벨 등) | `#9aa1ac` |
| 테이블 본문 보조 텍스트 | `#6b7280` |
| 카드/사이드바/헤더 border | `#e8e9ec` |
| 버튼/인풋 border | `#dcdfe4` |
| **Primary(브랜드 블루)** | `oklch(55% 0.16 258)` — 액티브 nav, primary 버튼, 차트 바 |
| Primary 텍스트(연한 블루 배경 위) | `oklch(46% 0.16 258)` |
| 연한 블루 배경(액티브 nav/배지) | `oklch(95% 0.03 258)` |
| 카드 radius | 12px (`rounded-xl`) |
| 배지 radius | 6px (`rounded-md`) |
| 카드 그림자 | `0 1px 2px rgba(16,24,40,0.04)` |
| 폰트 | 내부 화면은 시스템 sans, **로그인 화면만 예외로 Pretendard** + 파란색(#2563eb) 그라디언트 히어로 |

**배지 색상 매핑** (`src/utils/badgeColors.ts`, `Badge`의 `color` prop과 연결):
- green(`oklch(95% 0.05 152)`/`oklch(42% 0.13 152)`) = 출석/진행중/활성/발송완료
- amber(`oklch(95% 0.06 75)`/`oklch(50% 0.14 75)`) = 지각
- red(`oklch(95% 0.045 20)`/`oklch(48% 0.18 20)`) = 결석/취소(세션)/실패
- gray(`#f1f2f4`/`#6b7280`) = 대기/종료/비활성/취소(알림)
- blue(`oklch(95% 0.03 258)`/`oklch(46% 0.16 258)`) = 예정/예약

- 로그인 화면은 마케팅 성격의 히어로 레이아웃이라 내부 앱(회색+블루 톤)과 완전히 다름 — 의도된 예외, STEP5에 반영됨
- **"조퇴" 상태는 최종적으로 존재하지 않는 것으로 확정**: Figma에만 있었고 이 목업(출석 상태는 PRESENT/LATE/ABSENT/WAITING만 있음)에도 백엔드 AttendanceStatus에도 없음 — `Badge`/`badgeColors.ts`에서 뺌
- 이 목업엔 "설정" 화면이 없어서(nav 7개) 사이드바에 우리가 직접 8번째 항목으로 추가함 (백엔드 설정 API 자체가 아직 없어서 MSW로 채울 예정, STEP3에서 이미 mock 처리됨)
- Figma MCP는 Starter 플랜 호출 한도에 걸려서 이후 화면들은 PNG 스크린샷 → Claude Design 목업 순서로 참고 자료가 바뀜

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
| 로그인 | ✅ 완료 (실제 백엔드 연동 검증됨) |
| 대시보드 | ✅ 완료 (Claude Design 목업 기준, 시드 데이터) |
| 출석 세션 관리 | ✅ 완료 (Claude Design 목업 기준, 시드 데이터 + 클라이언트 필터/검색) |
| 출석 현황 | ✅ 완료 (Claude Design 목업 기준, 시드 데이터 + 그룹/이름/상태 필터) |
| 사용자 관리 | ✅ 완료 (Claude Design 목업 기준, 시드 데이터 + 신규 사용자 추가 모달) |
| NFC 태그 관리 | ✅ 완료 (Claude Design 목업 기준, 시드 데이터 + 활성/비활성 토글) |
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

- STEP 5 후속 (2026-07-23): 로그인 실제 테스트 중 CORS 에러 발생(EC2 백엔드가 localhost:5173을 허용 origin으로 안 열어준 상태로 추정, Postman은 브라우저가 아니라 CORS 검사 자체를 안 받아서 정상 응답했던 것) → **Vite dev 프록시로 임시 우회**
  - `VITE_API_BASE_URL=/api`(상대경로, axios가 실제로 호출) + `VITE_API_PROXY_TARGET=http://YOUR_EC2_PUBLIC_IP:8080`(vite.config.ts server.proxy가 실제 전달할 주소, 실제 값은 로컬 .env에만)로 env 분리
  - 이 우회는 `npm run dev` 개발 서버에서만 동작. 나중에 실제로 프론트를 배포하면 결국 **백엔드 CORS 허용 목록에 배포된 프론트 origin을 추가하거나 리버스 프록시로 묶어야 함** (백엔드 저장소의 `cors.allowed-origins`/`application-prod.yml` 쪽 작업, 이 프론트 프로젝트 범위 밖)

- STEP 5 최종 확인 (2026-07-23): 백엔드에서 CORS 허용 origin에 5173 추가 완료, 로그인 실제 연동 성공
  - **`ApiResponse<T>` = `{ success, data, message }` 추정이 정확히 맞았음** (더 이상 가정 아님, 검증 완료)
  - `LoginResponse`에 `expiresIn`(3600), `tokenType`("Bearer"), `user`(id/username/name/role/passwordChanged) 추가 — 실제 응답 기준으로 타입 보강, `src/types/user.ts` 신설
  - **username은 이메일이 아니라 그냥 문자열**("admin") — Figma의 "이메일" 라벨/placeholder는 실제와 다르지만 UI는 시안 그대로 둠 (기능엔 영향 없음, `type="text"`라 문제 없음)
  - 로그인 성공 시 `user` 정보도 `localStorage`에 같이 저장하도록 추가 (다음 화면에서 관리자 이름 표시 등에 사용)

- STEP 6 (2026-07-23, 완료): 색상 시스템 교체(gray-800→oklch 블루) + 공통 레이아웃 + 대시보드 화면 구현. 브랜치 `feat/step6-layout-dashboard`
  - `Badge`: `status`(도메인 결합, present/late/absent/earlyLeave/waiting/active/inactive/default) → `color`(순수 프레젠테이션, green/amber/red/gray/blue) prop으로 리팩터링. 도메인→색상 매핑은 `src/utils/badgeColors.ts`의 `attendanceStatusMeta`가 담당 (목업의 `badge(kind, key)` 패턴과 동일한 관심사 분리)
  - `Button`: `primary` variant를 `#1f2937`(gray-800)에서 `oklch(55% 0.16 258)`(블루)로 교체. `brand`(로그인 전용 블루 CTA)는 유지
  - `Card`: `className`으로 배경색을 덮어쓰는 방식은 Tailwind 유틸리티 생성 순서 때문에 불안정 — `tone`('elevated'|'subtle') prop으로 리팩터링
  - `Table`: 제네릭 제약을 `T extends Record<string, unknown>`에서 `T extends object`로 완화 (인덱스 시그니처 없는 구체 interface와 함께 써도 컴파일 에러 안 나게)
  - `Layout.tsx` 신규: 사이드바(8개 nav) + 헤더(제목/알림 아이콘/유저 아바타) 공통 셸. `react-router`의 `useMatches()` + 라우트 `handle: { title }`로 헤더 제목을 화면마다 자동 표시
  - `router.tsx`: 최상위 placeholder 나열 방식에서 `Layout`을 부모로 둔 nested route로 재구성 (`/login`만 Layout 밖)
  - `DashboardPage.tsx`: 통계 카드 4개, 시간대별 바 차트, 상태분포 도넛(conic-gradient), 진행중 세션 카드(pulse 애니메이션), 최근 출석 테이블 — 전부 Claude Design 목업의 시드 데이터 그대로 사용, 실 연동은 TODO
  - `index.css`: 목업에만 있고 실제 CSS엔 없던 `@keyframes livePulse` 추가 (진행중 세션 점 애니메이션에 필요)

- STEP 6 후속 - 보안 이슈 (2026-07-23): 로컬에 `.git`이 없어져서 다시 `git init`하는 과정에서, `.env.example`/`CONTEXT.md` 커밋 히스토리에 실제 EC2 퍼블릭 IP(`43.201.20.36`)가 최초 커밋부터 그대로 남아있던 게 발견됨. 이 리포를 나중에 GitHub public으로 올릴 예정이라 **`git filter-branch`로 전체 11개 브랜치 히스토리를 rewrite해서 `YOUR_EC2_PUBLIC_IP` 플레이스홀더로 소급 교체** (실제 IP는 gitignore된 로컬 `.env`에만 남김). 이 시점부터 모든 브랜치의 커밋 해시가 바뀌었음 — 그 이전에 받은 번들 파일은 더 이상 유효하지 않음
  - `.gitattributes` 신규 추가(`* text=auto eol=lf`) — 리포 재생성 과정에서 CRLF/LF가 섞여 전체 파일이 diff에 잡히는 문제 발견, 이후 재발 방지용

- STEP 7 (2026-07-23, 완료): 출석 세션 관리 화면 구현. 브랜치 `feat/step7-sessions-page`
  - `SessionsPage.tsx`: 상태 필터(전체/예정/진행중/종료/취소) + 세션명 검색(클라이언트 사이드) + 세션 테이블 + 세션 상세 모달. Claude Design 목업의 세션관리 화면 시드 데이터(6건) 그대로 사용, 실 연동은 TODO(`GET /api/sessions` 등)
  - `types/session.ts` 신규: `Session`, `SessionStatus`(`SCHEDULED`/`ACTIVE`/`COMPLETED`/`CANCELED`) 타입
  - `utils/badgeColors.ts`: `sessionStatusMeta` 추가 (예정=blue/진행중=green/종료=gray/취소=red)
  - `Table`: STEP4 때 만든 `border-gray-200/rounded-md` 스타일을 목업 기준 카드 토큰(`#e8e9ec` 테두리, `rounded-xl`, 그림자, 헤더 행 `#fafbfc` 배경)으로 교체 — 이제 Table 자체가 카드 프레임을 겸함. `DashboardPage`의 "최근 출석 기록"도 Card로 이중 감싸던 걸 제거(카드 속 카드 방지)
  - `Modal`: STEP4 때 시안이 없어서 임의로 잡았던 톤(`rounded-xl`, `bg-black/40`)을 목업의 세션 상세 모달 실측 토큰(`rounded-[14px]`, overlay `rgba(15,17,21,.45)`, 그림자 `0 20px 60px rgba(16,24,40,.25)`)으로 교체
  - `Button`: `size` prop(`md`|`sm`) 추가 — 테이블 행 안의 "상세"/"수정" 같은 인라인 액션 버튼용. 앞으로 나올 화면(출석현황/사용자관리/NFC관리)에도 동일 패턴이 반복될 걸로 예상돼 공용화
  - **빌드 검증**: 사용자 로컬에서 `npm install`이 끝나 `node_modules`가 실제로 존재하는 걸 확인하고 처음으로 `npx tsc --noEmit` 실행 — 이 과정에서 STEP2 이후 한 번도 안 걸렸던 진짜 버그 2개 발견/수정:
    - `tsconfig.json`의 `baseUrl`/`paths`(`@/*`) — TS 6에서 deprecated돼 빌드 자체가 막힘, 실제 사용처가 없어서 제거
    - `tsconfig.json`의 `target`/`lib`가 `ES2020`이라 `Layout.tsx`의 `matches.at(-1)`(배열 `.at()`, ES2022)가 타입 에러 — `ES2022`로 상향
  - (참고) `npx vite build`는 사용자가 Windows에서 `npm install`한 네이티브 바이너리(rolldown)라 리눅스 샌드박스에서는 못 돌려봄(`Cannot find module '@rolldown/binding-linux-x64-gnu'`) — 타입체크만 샌드박스에서 확인, 실제 빌드는 로컬에서 `npm run build`로 검증 필요

- STEP 8 (2026-07-23, 완료): 출석 현황 조회 화면 구현. 브랜치 `feat/step8-attendance-page`
  - `AttendancePage.tsx`: 상단 필터바(날짜/세션 select는 목업이 옵션 1개뿐이라 지금은 비활성 정적 표시, 그룹 select + 이름 검색은 실제 클라이언트 필터링) + 상태 필터 칩(전체/출석/지각/결석/대기, `Button variant="chip"` 재사용) + 5칸 통계 카드(대상자수/출석/지각/결석/출석률) + 9열 출석 테이블. Claude Design 목업의 출석 현황 화면 시드 데이터(8건, 백엔드 프로젝트 주간회의 세션 기준) 그대로 사용, 실 연동은 TODO(`GET /api/attendances` 등)
  - `types/attendance.ts` 신규: `AttendanceRecord`, `AttendanceStatus` 타입 — 기존에 `badgeColors.ts`/`DashboardPage.tsx`에 흩어져 있던 인라인 유니언(`'PRESENT'|'LATE'|'ABSENT'|'WAITING'`)을 이 타입으로 통일
  - 출석률(%)은 목업엔 정적 값(50%)으로 박혀있었는데, 실제로는 `present/total`을 반올림해서 계산하도록 구현 (정적 숫자를 그대로 베끼는 것보단 최소한의 실계산이 낫다고 판단)
  - 상태 필터 칩은 새 컴포넌트 안 만들고 기존 `Button`의 `chip` variant(STEP4 때 이미 있었음)를 그대로 재사용 — 목업 스펙(비활성 회색 테두리, 활성 시 블루 배경/글자)과 거의 일치
  - STEP7에서 만든 `SessionsPage`/신규 `AttendancePage`의 테이블 바로 위에 불필요한 `mt-4`가 있던 걸 발견해서 제거 — `Layout`의 `<main>`이 이미 `gap-[22px]`로 자식 간 간격을 주고 있어서 중복 여백이었음
  - `DashboardPage.tsx`의 `RecentCheck.status` 타입도 `keyof typeof attendanceStatusMeta` 대신 새로 만든 `AttendanceStatus`를 import해서 쓰도록 정리

- STEP 9 (2026-07-23, 완료): 사용자 관리 화면 + 신규 사용자 추가 모달 구현. 브랜치 `feat/step9-users-page`
  - `UsersPage.tsx`: 통계 카드 4개(정적 값, 목업도 users 배열과 무관한 하드코딩) + 그룹/상태 필터 + 이름·학번 검색 + 8열 테이블 + "신규 사용자 추가" 모달. 목업과 다르게 **모달 제출을 실제로 동작하게 만듦**(클라이언트 상태에만 추가, 목업은 버튼에 핸들러가 없는 정적 목업이었음) — TODO로 실제 `POST /api/users` 연동 표시
  - `types/student.ts` 신규: `StudentAccount` 타입 — 로그인한 관리자 본인 정보인 `types/user.ts`의 `User`와는 다른 도메인이라 분리(관리자가 "관리하는" 학생 계정 목록)
  - `utils/badgeColors.ts`: `userStatusMeta` 추가 — active가 boolean이라 다른 상태들처럼 `Record`가 아니라 함수 형태(`userStatusMeta(active)`)로 다르게 만듦
  - `Input`/`Select`: STEP4(Figma) 톤(`gray-300` border, `gray-800` 포커스 링)을 이번에 처음 폼에서 제대로 써보면서 목업 토큰(`#dcdfe4` border, `rounded-lg`, 블루 포커스 링)으로 교체 — Table/Modal/Button에 이어 공통 컴포넌트 색상 정정 마무리
  - `Select`: `value`로 완전히 controlled하게 쓸 때(그룹 선택 등) 빈 placeholder 옵션이 끼어들면서 `defaultValue`/`value` 동시 지정 경고가 나는 걸 발견 → `value` prop 존재 여부로 분기해서 controlled일 땐 placeholder 옵션 자체를 안 넣도록 수정
  - **알려진 차이점**: 목업의 "신규 사용자 추가" 모달은 폭 420px인데 공용 `Modal` 컴포넌트는 세션 상세 모달 기준 460px로 고정돼 있음 — 40px 차이는 사소하다고 판단해 별도 size prop 안 만들고 그냥 460px로 통일함

- STEP 10 (2026-07-23, 완료): NFC 태그 관리 화면 구현. 브랜치 `feat/step10-nfc-tags-page`
  - `NfcTagsPage.tsx`: 통계 카드 4개(정적 값) + 상태 필터(전체/활성/비활성) + 7열 테이블(태그명/UID/설치위치/연결된세션/마지막사용/상태/액션). "활성화"/"비활성화" 토글 버튼은 실제로 동작하게 만듦(클라이언트 상태만, TODO: 실제 `PATCH /api/nfc-tags/:id`), "수정"/"+ 신규 태그 등록"은 목업에 폼 시안 자체가 없어서 정적 버튼으로 남김
  - `types/nfcTag.ts` 신규: `NfcTag`, `NfcTagStatus`(`ACTIVE`/`INACTIVE` 2종뿐, "분실" 등 없음) 타입
  - `utils/badgeColors.ts`: `nfcTagStatusMeta` 추가
  - UID 컬럼은 목업이 `font-family: monospace`를 썼길래 `font-mono` 클래스로 반영

## 다음 작업

1. STEP 11~: 나머지 화면 구현 (통계/알림관리) — Claude Design 목업에 전 화면 데이터/구조가 이미 상세히 나와있어서 참고 자료로 바로 사용 가능. 그때그때 필요한 api 함수 추가
2. 로컬에 실제 git 저장소가 생겼으니, 이제 이 세션에서 매 STEP마다 `git bundle`을 새로 만들어 전달하는 대신 **브랜치명/코드/커밋 메시지만 안내하고 사용자가 직접 로컬에서 커밋**하는 방식으로 전환 (샌드박스가 마운트된 D 드라이브에서 `git checkout -f` 등 델리트가 필요한 git 명령을 실행하면 FUSE 마운트 제약으로 계속 실패하는 걸 이번에 다시 확인함)

## 결정 사항 히스토리

- 2026-07-23: 웹은 포트폴리오 목적이 아니라 백엔드를 보여주기 위한 관리자 화면 → 계층 분리(service/mapper)·학습 콜아웃·연습과제 등 러닝가이드식 프로세스는 폐기, 단순한 STEP 진행 방식으로 확정
- 2026-07-23: `LEARNING_GUIDE.md`/`ARCHITECTURE.md`는 만들지 않고 `CONTEXT.md`만 유지하기로 결정 (다른 채팅에서 이어가기 위한 최소한의 문서)
- 2026-07-23: MSW는 전체 API가 아니라 백엔드에 아직 없는 API(설정 API, 사용자 대시보드 API)에 한해서만 사용
- 2026-07-23: react-router v7이 아니라 v8(현재 최신, `react-router` 패키지)로 확정 — 검색 결과 최신판이 이미 v8이었음
- 2026-07-23: STEP3에서 api 함수를 8개 도메인 전부 한 번에 만들지 않고 auth만 먼저 만들기로 함(로그인에 필요) — 나머지는 화면 없는 상태에서 미리 만드는 게 선구현(과설계)이라 판단, 해당 화면 STEP에서 추가
- 2026-07-23: MSW의 `public/mockServiceWorker.js`는 `npx msw init public/ --save` 명령으로 로컬에서 직접 생성해야 함 (버전별 정확한 스크립트라 손으로 안 만듦)
- 2026-07-23: Claude Design 목업(`Admin Web Page Mockups.html`)이 Figma의 gray-800 색상 가정을 대체하는 최종 디자인 기준으로 확정 — 화면 7개를 전부 커버하고 실제 상태값/색상 로직까지 JS로 들어있어 Figma보다 구체적임 (§디자인 토큰 참고)
- 2026-07-23: "조퇴"(EARLY_LEAVE) 상태는 최종적으로 존재하지 않는 것으로 확정 — Figma에만 있던 상태였고, 목업의 출석 상태(PRESENT/LATE/ABSENT/WAITING)와 실제 백엔드 enum 둘 다에 없음 확인
- 2026-07-23: `Card`는 `className`으로 배경 오버라이드하는 방식 대신 `tone` prop 방식으로 확정 — Tailwind는 CSS 생성 순서가 HTML 클래스 순서와 무관하게 우선순위를 결정해서 className 문자열 이어붙이기로 배경색을 덮어쓰는 게 신뢰할 수 없음
- 2026-07-23: 이 리포는 GitHub에 **public**으로 올릴 예정으로 확정 → 커밋 히스토리에 남아있던 실제 EC2 IP를 `filter-branch`로 전부 소급 제거. 이후 실제 서버 주소/키 등 민감정보는 항상 로컬 `.env`에만 두고 `.env.example`엔 플레이스홀더만 쓰는 걸 원칙으로 함
- 2026-07-23: 샌드박스에서 마운트된 D 드라이브(`.git` 포함)에 대고 `git checkout -f`/`filter-branch` 같은 delete 필요한 git 명령을 실행하면 FUSE 마운트 제약(unlink 불가)으로 계속 깨짐 확인 → 앞으로는 파일 내용 수정(Write/Edit)까지만 샌드박스에서 하고, 실제 git 커밋/브랜치 작업은 브랜치명·코드·커밋 메시지를 안내해서 **사용자가 로컬에서 직접 실행**하는 방식으로 전환
- 2026-07-23: `Table`/`Modal`을 STEP4의 임의 톤에서 STEP7에 확보한 목업 실측 토큰으로 교체 — Table이 자체 카드 프레임(테두리/radius/그림자)을 갖게 되면서, 화면에서 Table을 Card로 다시 감싸면 카드 속 카드가 되므로 그렇게 쓰지 않기로 함
- 2026-07-23: `tsconfig.json`에 실제 버그 2건(`baseUrl`/`paths` deprecated, `lib`가 ES2020이라 `Array.prototype.at()` 타입 에러) 존재했던 걸 STEP7에서 최초로 `npx tsc --noEmit`을 돌려보고서야 발견 — 사용자 로컬에 `node_modules`가 생긴 이후부터는 코드 작성 시 가능하면 매번 타입체크까지 확인하기로 함
- 2026-07-23: `Badge`는 도메인 결합적인 `status` prop 대신 순수 프레젠테이션 `color` prop으로 확정, 도메인→색상 매핑은 화면/유틸 레벨(`badgeColors.ts`)에서 담당하기로 함 — 목업의 `badge(kind, key)` 헬퍼 패턴을 따름
