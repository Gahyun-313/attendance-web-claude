# 🖥️ 출석하자 Admin Web

![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

NFC 기반 출석 관리 시스템의 관리자용 Web 대시보드입니다.

출석 세션, 사용자, NFC 태그와 알림을 관리하고 Spring Boot Backend의 출석 현황과 통계를 확인할 수 있도록 React와 TypeScript로 구현했습니다.

## 🖼️ 주요 화면

| 로그인 | 대시보드 | 세션 관리 | 출석 현황 |
| --- | --- | --- | --- |
| <img width="1920" height="1127" alt="image" src="https://github.com/user-attachments/assets/9e4b8264-6bb2-4a2e-a1e6-93a8a412b525" />
 | `<대시보드 화면 첨부>` | <img width="960" height="564" alt="image" src="https://github.com/user-attachments/assets/d82e55d2-22a3-4a17-85f6-f6269006e59f" />
 | <img width="960" height="564" alt="image" src="https://github.com/user-attachments/assets/252e685c-76bf-4331-bbd9-634c6a6e6595" />
 |
| 일반·Google·Kakao 로그인과 비밀번호 재설정 | 오늘 세션과 진행 중인 세션 요약 | 세션 검색·생성·수정 및 상태 전이 | 출석 목록 필터와 상태 수정 |

| 사용자 관리 | NFC 태그 관리 | 알림 | 설정 |
| --- | --- | --- | --- |
| <img width="1920" height="1127" alt="image" src="https://github.com/user-attachments/assets/29826941-00a7-4f90-9fb1-a863a08198a5" />
 | <img width="1920" height="1127" alt="image" src="https://github.com/user-attachments/assets/2082f066-b152-4268-a192-d71fa9de0b2d" />
 | <img width="1920" height="1127" alt="image" src="https://github.com/user-attachments/assets/f34e2293-0c4c-4395-9355-ee86a4c75a7c" (알림) />
 | <img width="1920" height="1127" alt="image" src="https://github.com/user-attachments/assets/b47b99ce-3123-4dde-878c-5c59da09a200" /> (설정)
 |
| 계정 생성·수정·비활성화·재활성화 | 태그 등록·수정과 활성 상태 관리 | 알림 관리 | 조직·계정 설정 |

## 📌 프로젝트 정보

| 항목 | 내용 |
| --- | --- |
| 형태 | 개인 프로젝트의 관리자 Web |
| 목적 | Backend 기능 검증 및 시연 |
| 담당 | 요구사항·화면 흐름 설계, Backend 연동과 기능 검증 |
| 구현 방식 | Figma·디자인 컨텍스트와 AI 개발 도구를 활용한 React/TypeScript 구현 |
| 배포 | 미배포, 로컬에서 AWS Backend와 연동 검증 |

## 👨‍💻 담당 범위

- 관리자 요구사항과 9개 화면 흐름 직접 설계
- Figma 및 디자인 컨텍스트를 바탕으로 공통 UI와 화면 구성
- Backend API 계약을 확인하고 Axios·TanStack Query 기반으로 연동
- JWT 자동 첨부, Access Token 만료 시 단일 Refresh 요청과 원 요청 재시도 구현
- 세션·출석·사용자·NFC·통계·알림·조직 설정의 정상 및 예외 시나리오 검증
- Backend 응답 DTO와 화면 타입 불일치를 찾아 수정

화면 코드 생성에는 AI 개발 도구를 활용했으며, 요구사항 정의, 화면 흐름, API 연동 판단과 실제 기능·예외 검증은 직접 수행했습니다. 관리자 Web은 실제 배포하지 않았으므로 Web 배포·운영 경험으로 표현하지 않습니다.

## 🛠️ Tech Stack

| Category | Stack |
| --- | --- |
| Core | React, TypeScript, Vite |
| Routing | React Router |
| Server State | TanStack Query |
| Network | Axios |
| Styling | Tailwind CSS |
| Mock | MSW |

## ✨ 주요 구현

### Backend 중심의 화면 구조

화면별로 필요한 API 함수와 타입을 함께 추가하고, 필요하지 않은 전역 상태나 복잡한 프론트엔드 아키텍처는 도입하지 않았습니다. 공통 컴포넌트와 API·타입·화면의 역할만 분리했습니다.

[구조 자세히 보기](./docs/ARCHITECTURE.md)

### JWT 자동 갱신

여러 요청이 동시에 401을 받아도 Refresh API를 한 번만 호출하도록 진행 중인 Promise를 공유합니다. 인증 API 자체는 갱신 대상에서 제외하고, 재시도 플래그로 무한 루프를 방지했습니다.

[인증 흐름 자세히 보기](./docs/AUTHENTICATION_FLOW.md)

### 실제 API 계약 검증

초기 화면의 임시 데이터를 제거하고 실제 Backend 응답으로 교체했습니다. 통계 필드명과 NFC 태그의 중첩 응답 구조가 화면의 추정 타입과 다른 문제를 실제 DTO와 대조해 수정했습니다.

### 관리자 기능 통합

세션 생성·상태 전이, 출석 수정, 사용자 관리, NFC 태그 관리, 알림과 조직 설정을 Backend API에 연결했습니다. Google·Kakao 인증과 비밀번호 재설정·변경 흐름도 실제 서버에서 검증했습니다.

## 📊 구현 상태

| Area | Status |
| --- | --- |
| 인증 및 토큰 갱신 | 구현·서버 연동 완료 |
| 세션·출석·사용자·NFC 관리 | 구현·서버 연동 완료 |
| 통계·랭킹 | 구현·서버 연동 완료 |
| 알림·조직·계정 설정 | 구현·서버 연동 완료 |
| 대시보드 일부 카드 | 실 API 연동 |
| 대시보드 차트·최근 기록 | 대응 API가 없어 빈 상태 |
| WebSocket 실시간 수신 | 미적용 |
| 자동화 테스트 | 미구성 |
| Web 배포 | 미배포 |

[세부 구현 상태와 한계 보기](./docs/IMPLEMENTATION_STATUS.md)

## 📚 Documentation

| Document | Description |
| --- | --- |
| [Architecture](./docs/ARCHITECTURE.md) | 화면, API와 서버 상태의 구성 |
| [Authentication Flow](./docs/AUTHENTICATION_FLOW.md) | 로그인과 JWT 자동 갱신 |
| [Implementation Status](./docs/IMPLEMENTATION_STATUS.md) | 실제 연동 범위와 미구현 항목 |
