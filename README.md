<p align="center">
  <img src="docs/assets/wave-bubble.svg" width="180" alt="Carry Logo" />
</p>

<h1 align="center">Carry Customer Web</h1>

<p align="center">
  <strong>코인 세탁 배달 O2O 서비스 고객용 웹 앱</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Vitest-190_tests-6E9F18?logo=vitest&logoColor=white" alt="Vitest" />
  <img src="https://img.shields.io/badge/Storybook-8-FF4785?logo=storybook&logoColor=white" alt="Storybook" />
</p>

<p align="center">
  고객이 세탁물 수거를 요청하고, 결제하고, 배달 상태를 추적하는<br/>
  Android WebView 기반 모바일 퍼스트 프론트엔드입니다.
</p>

---

## 목차

- [기술 스택](#기술-스택)
- [아키텍처](#아키텍처)
- [주요 특징](#주요-특징)
- [시작하기](#시작하기)
- [프로젝트 구조](#프로젝트-구조)
- [환경변수](#환경변수)
- [문서](#문서)

---

## 기술 스택

```
프레임워크   Next.js 14 (App Router)           상태 관리    Zustand 4 + React Query 5
언어         TypeScript 5                      스타일링     Tailwind CSS 3 + CVA
인증         NextAuth v5 (beta)                결제         Toss Payments SDK
지도         Naver Maps SDK                    모니터링     Sentry (client/server/edge)
테스트       Vitest + RTL + MSW                UI 개발      Storybook 8
코드 품질    ESLint + Prettier + Husky         환경변수     t3-env + Zod 검증
```

---

## 아키텍처

> Feature-Sliced Design에서 영감을 받은 모듈 구조입니다.
> 상세 내용은 **[아키텍처 가이드](docs/architecture.md)** 를 참고하세요.

```
src/
├── app/                    # Next.js App Router
│   ├── (app)/              #   하단 네비게이션 레이아웃 (홈, 마이, 팀)
│   └── (fullscreen)/       #   풀스크린 레이아웃 (주문, 결제, 지도 등)
├── features/               # 도메인별 기능 모듈
│   ├── auth/               #   소셜 로그인, 토큰 관리
│   ├── address/            #   배송지 CRUD, 주소 검색
│   ├── order/              #   주문 생성, 세탁 아이템 선택
│   ├── payment/            #   Toss 결제 요청 및 승인
│   ├── map/                #   Naver Maps 렌더링
│   ├── status/             #   주문 상태 추적
│   ├── review/             #   리뷰 작성, 조회
│   └── location/           #   지역 선택 (서울/인천)
└── shared/                 # 공유 인프라
    ├── api/                #   API 클라이언트 (return-fetch)
    ├── config/             #   환경변수 검증 (t3-env)
    ├── providers/          #   React Query, Auth 프로바이더
    ├── ui/                 #   22개 이상 공통 컴포넌트
    └── lib/                #   WebView 브릿지, 유틸리티
```

---

## 주요 특징

| 영역 | 내용 |
|------|------|
| **모바일 퍼스트** | Android WebView 브릿지로 GPS, 푸시 알림 등 네이티브 기능 연동 |
| **지도 기반 UX** | Naver Maps SDK를 활용한 주소 선택과 매장 위치 시각화 |
| **간편 결제** | Toss Payments SDK 통합 (카드, 간편결제 지원) |
| **소셜 로그인** | Kakao OAuth + NextAuth v5 기반 인증 |
| **에러 모니터링** | Sentry 클라이언트/서버/엣지 3중 에러 추적 |
| **환경변수 검증** | t3-env + Zod로 빌드 타임에 필수 변수 누락 차단 |
| **보안 헤더** | X-Frame-Options, X-Content-Type-Options 등 5종 적용 |
| **테스트 커버리지** | Vitest + RTL + MSW 기반 190개 테스트 |

---

## 시작하기

### 사전 요구사항

- **Node.js** 18 이상
- **pnpm** 9.5 이상

### 설치

```bash
# 저장소 클론
git clone https://github.com/Coinlaundryapp/carry-app.git
cd carry-app

# 의존성 설치
pnpm install

# 환경변수 설정
cp .env.example .env.local
# .env.local 파일을 열어 각 값을 입력하세요
```

### 개발 서버

```bash
pnpm dev          # Next.js 개발 서버 (http://localhost:3000)
pnpm storybook    # Storybook UI 개발 (http://localhost:6006)
```

### 품질 검사

```bash
pnpm test             # 190개 테스트 실행
pnpm test:watch       # 워치 모드
pnpm test:coverage    # 커버리지 리포트
pnpm typecheck        # TypeScript 타입 검사
pnpm validate         # lint + format + typecheck + test 한 번에 실행
```

---

## 프로젝트 구조

```
carry-app/
├── public/assets/         # 정적 에셋 (아이콘, 이미지)
├── src/
│   ├── app/               # 26개 라우트 페이지
│   ├── features/          # 8개 도메인 모듈
│   └── shared/            # 공유 라이브러리, UI, API
├── sentry.*.config.ts     # Sentry 초기화 (client/server/edge)
├── next.config.mjs        # Next.js 설정 + 보안 헤더 + Sentry
├── tailwind.config.ts     # 디자인 토큰, 커스텀 유틸리티
└── vitest.config.ts       # 테스트 설정
```

---

## 환경변수

`.env.example` 파일을 참고하세요. 필수 변수는 t3-env + Zod로 빌드 타임에 검증됩니다.

| 변수 | 필수 | 용도 |
|------|------|------|
| `NEXT_PUBLIC_BACKEND_URL` | O | 백엔드 API 주소 |
| `AUTH_SECRET` | O | NextAuth 시크릿 키 |
| `NEXT_PUBLIC_NAVER_ID` | O | Naver Maps 클라이언트 ID |
| `NEXT_PUBLIC_KAKAO_REST_API_KEY` | O | Kakao OAuth API 키 |
| `NEXT_PUBLIC_KAKAO_REDIRECT_URL` | O | Kakao OAuth 리다이렉트 URL |
| `NEXT_PUBLIC_TOSS_CLIENT_KEY` | O | Toss Payments 클라이언트 키 |
| `SENTRY_DSN` | - | Sentry DSN (없으면 비활성화) |

---

## 문서

- [아키텍처 가이드](docs/architecture.md) — 프로젝트 구조와 설계 결정 상세 설명
- [Android WebView 연동](docs/android-webview-integration.md) — 네이티브 앱 브릿지 가이드

---

## 라이선스

Private — All rights reserved.
