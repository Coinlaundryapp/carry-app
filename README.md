<p align="center">
  <img src="docs/assets/wave-bubble.svg" width="180" alt="Carry Logo" />
</p>

<h1 align="center">Carry App</h1>

<p align="center">
  <strong>코인 세탁 배달 O2O 서비스 프론트엔드 모노레포</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Turborepo-monorepo-EF4444?logo=turborepo&logoColor=white" alt="Turborepo" />
  <img src="https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Vitest-190_tests-6E9F18?logo=vitest&logoColor=white" alt="Vitest" />
</p>

<p align="center">
  고객, 배달원, 코디네이터 3개 웹 앱과<br/>
  공유 패키지를 관리하는 Turborepo 모노레포입니다.
</p>

---

## 목차

- [모노레포 구조](#모노레포-구조)
- [앱 목록](#앱-목록)
- [기술 스택](#기술-스택)
- [시작하기](#시작하기)
- [개발 명령어](#개발-명령어)
- [문서](#문서)
- [관련 저장소](#관련-저장소)

---

## 모노레포 구조

```
carry-app/
├── apps/
│   ├── customer-web/         # 고객용 웹 앱 (Android WebView)
│   ├── carrier-web/          # 배달원용 웹 앱 (예정)
│   └── coordinator-web/      # 코디네이터용 웹 앱 (예정)
├── packages/
│   ├── ui/                   # 공유 UI 컴포넌트 (추출 예정)
│   ├── types/                # 공유 타입 정의 (추출 예정)
│   └── config/               # 공유 설정 (추출 예정)
├── docs/                     # 프로젝트 문서
├── turbo.json                # Turborepo 태스크 파이프라인
└── pnpm-workspace.yaml       # pnpm 워크스페이스
```

---

## 앱 목록

| 앱 | 포트 | 상태 | 설명 |
|----|------|------|------|
| **customer-web** | 3000 | 운영 중 | 고객용 — 세탁물 주문, 결제, 상태 추적 |
| **carrier-web** | 3001 | 예정 | 배달원용 — 배차 수락, 수거/배달 관리 |
| **coordinator-web** | 3002 | 예정 | 코디네이터용 — 운영 대시보드, 배차 관리 |

---

## 기술 스택

```
빌드 시스템   Turborepo + pnpm workspace
프레임워크    Next.js 14 (App Router)           상태 관리    Zustand 4 + React Query 5
언어          TypeScript 5                      스타일링     Tailwind CSS 3 + CVA
인증          NextAuth v5 (beta)                결제         Toss Payments SDK
지도          Naver Maps SDK                    모니터링     Sentry (client/server/edge)
테스트        Vitest + RTL + MSW                UI 개발      Storybook 8
코드 품질     ESLint + Prettier + Husky         환경변수     t3-env + Zod 검증
```

---

## 시작하기

### 사전 요구사항

- **Node.js** 20 이상
- **pnpm** 9.5 이상

### 설치

```bash
git clone https://github.com/Coinlaundryapp/carry-app.git
cd carry-app
pnpm install
```

### 환경변수

```bash
cp apps/customer-web/.env.example apps/customer-web/.env.local
# .env.local 파일에 값 입력
```

---

## 개발 명령어

```bash
# 전체 앱 동시 실행
pnpm dev

# 특정 앱만 실행
pnpm turbo run dev --filter=customer-web
pnpm turbo run dev --filter=carrier-web

# 전체 빌드
pnpm build

# 전체 테스트
pnpm test

# 전체 타입 검사
pnpm typecheck

# 전체 검증 (lint + typecheck + test)
pnpm validate
```

---

## 문서

- [아키텍처 가이드](docs/architecture.md) — customer-web 프로젝트 구조와 설계 결정
- [Android WebView 연동](docs/android-webview-integration.md) — 네이티브 앱 브릿지 가이드

---

## 관련 저장소

| 저장소 | 설명 |
|--------|------|
| [carry-platform](https://github.com/Coinlaundryapp/carry-platform) | 백엔드 (Spring Boot + Kotlin) |
| [carry-customer-android](https://github.com/Coinlaundryapp/carry-customer-android) | 고객용 Android 앱 |
| [carry-carrier-android](https://github.com/Coinlaundryapp/carry-carrier-android) | 배달원용 Android 앱 |

---

## 라이선스

Private — All rights reserved.
