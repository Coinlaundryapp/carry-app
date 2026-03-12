# Carry 아키텍처 가이드

> 이 문서는 Carry 고객용 웹 앱의 전체 아키텍처와 설계 결정을 설명합니다.

---

## 목차

- [전체 구조](#전체-구조)
- [라우트 설계](#라우트-설계)
- [Feature 모듈](#feature-모듈)
- [Shared 레이어](#shared-레이어)
- [데이터 흐름](#데이터-흐름)
- [인증 구조](#인증-구조)
- [WebView 브릿지](#webview-브릿지)
- [에러 처리 전략](#에러-처리-전략)
- [테스트 전략](#테스트-전략)
- [보안](#보안)

---

## 전체 구조

Feature-Sliced Design에서 영감을 받은 3계층 구조를 사용합니다.

```
src/
├── app/          ← 라우팅 + 레이아웃 (오케스트레이션)
├── features/     ← 도메인 기능 (비즈니스 로직)
└── shared/       ← 공유 인프라 (의존성 없음)
```

### 의존성 규칙

```
app → features → shared
          ↓
        shared
```

- `shared/`는 다른 레이어에 의존하지 않습니다.
- `features/`는 `shared/`만 임포트합니다. 다른 feature를 직접 임포트하지 않습니다.
- `app/`은 `features/`와 `shared/`를 조합하여 페이지를 구성합니다.

---

## 라우트 설계

Next.js 14 App Router의 Route Group을 활용하여 두 가지 레이아웃을 분리합니다.

```
app/
├── (app)/                  # 하단 네비게이션이 있는 메인 레이아웃
│   ├── (home)/page.tsx     #   홈 (주문 목록)
│   ├── my/page.tsx         #   마이페이지
│   ├── my/setting/         #   설정
│   └── team/page.tsx       #   팀 정보
│
├── (fullscreen)/           # 하단 네비 없는 풀스크린 레이아웃
│   ├── login/              #   소셜 로그인
│   ├── address/            #   배송지 (목록, 추가, 수정, 요청수정)
│   ├── order/              #   주문 (세탁 유형별 동적 라우트)
│   ├── payment/            #   결제 (Toss SDK)
│   ├── status/             #   주문 상태 상세
│   ├── map/                #   지도 (Naver Maps)
│   ├── locale/             #   지역 선택 (서울/인천)
│   ├── my/review/          #   리뷰 관리
│   └── imageView/          #   이미지 뷰어
│
└── error/page.tsx          # 전역 에러 페이지
```

### 레이아웃 선택 기준

| Route Group | 용도 | 특징 |
|-------------|------|------|
| `(app)` | 탭 간 이동이 필요한 메인 화면 | `BottomNavigation` 포함 |
| `(fullscreen)` | 단일 흐름 (주문, 결제 등) | `FunnelHeader`로 뒤로가기 제공 |

---

## Feature 모듈

각 feature는 독립적인 도메인 단위로, 내부에 `api/`, `ui/`, `lib/`, `model/` 디렉터리를 갖습니다.

```
features/{name}/
├── api/          # 서버 통신 (fetch 함수, React Query 훅)
├── ui/           # 도메인 전용 컴포넌트
├── lib/          # 비즈니스 로직, 유틸리티, 커스텀 훅
├── model/        # Zustand 스토어, 타입 정의
└── index.ts      # 공개 API (re-export)
```

### 8개 Feature 모듈

| 모듈 | 역할 | 주요 기술 |
|------|------|-----------|
| **auth** | 소셜 로그인, 토큰 갱신, 세션 관리 | NextAuth v5, Kakao OAuth |
| **address** | 배송지 CRUD, 주소 검색, 폼 유효성 검사 | Zustand, 주소 검색 API |
| **order** | 세탁 주문 생성, 아이템 선택 | 동적 라우트 `[orderUnitType]/[orderRequestType]/[laundryItemType]` |
| **payment** | Toss Payments 결제 요청 및 승인 | Toss SDK |
| **map** | Naver Maps 렌더링, 마커, 현재 위치 | Naver Maps SDK, WebView GPS |
| **status** | 주문 상태 조회, 진행 단계 시각화 | React Query polling |
| **review** | 리뷰 작성 및 조회 | - |
| **location** | 서비스 지역 선택 (서울/인천 구별) | - |

---

## Shared 레이어

모든 feature에서 공유하는 인프라 코드입니다.

### `shared/api/` — API 클라이언트

`return-fetch` 라이브러리 기반의 래퍼로, 응답 인터셉터에서 400 이상 상태 코드를 `ApiError`로 변환합니다.
Sentry 브레드크럼을 자동으로 기록합니다.

```
요청 → return-fetch (baseUrl 주입) → 응답 인터셉터 → JSON 파싱
                                       ↓ (4xx/5xx)
                                    ApiError throw + Sentry breadcrumb
```

### `shared/ui/` — 공통 컴포넌트

22개 이상의 재사용 컴포넌트를 제공합니다. `class-variance-authority`(CVA)로 variant를 관리하고,
Storybook으로 시각적 문서화를 합니다.

주요 컴포넌트: `Alert`, `Button`, `Modal`, `Input`, `Dropdown`, `Tab`, `Toast`,
`BottomNavigation`, `TopNavigation`, `FunnelHeader`, `ProgressBar`, `Chip`, `Tag` 등

### `shared/config/` — 환경변수 검증

`t3-env` + `zod`로 빌드 타임에 환경변수를 검증합니다.
서버 변수(`AUTH_SECRET`)와 클라이언트 변수(`NEXT_PUBLIC_*`)를 분리하여 타입 안전성을 보장합니다.

### `shared/lib/` — 유틸리티

- **WebView 브릿지** (`webview-bridge.ts`): `callBridge()`, `registerCallback()` 헬퍼로 Android 네이티브 통신을 추상화
- **유틸 함수**: `cn()` (tailwind-merge + clsx), 날짜 포맷, 가격 포맷 등

### `shared/providers/` — 글로벌 프로바이더

- **ReactQueryProviders**: staleTime 60초, gcTime 5분, 재시도 2회 + 지수 백오프
- **AuthProvider**: NextAuth 세션 관리

---

## 데이터 흐름

### 서버 상태 (React Query)

```
컴포넌트 → useQuery / useMutation
              ↓
         feature/api/ 함수 호출
              ↓
         shared/api/api-client (fetchExtended)
              ↓
         백엔드 API → JSON 응답
              ↓
         React Query 캐시 → 컴포넌트 리렌더
```

### 클라이언트 상태 (Zustand)

페이지 간 공유가 필요한 상태(주문 폼 데이터, 선택된 주소 등)는 Zustand 스토어로 관리합니다.
각 feature의 `model/` 디렉터리에 스토어를 정의합니다.

```
사용자 입력 → Zustand store.setState()
                  ↓
             구독 중인 컴포넌트 리렌더
```

### React Query 회복탄력성 설정

| 설정 | 값 | 이유 |
|------|------|------|
| `staleTime` | 60초 | SSR 데이터 즉시 리페치 방지 |
| `gcTime` | 5분 | 비활성 쿼리 캐시 유지 |
| `retry` (queries) | 2회 | 모바일 일시적 네트워크 오류 대응 |
| `retryDelay` | 지수 백오프 (최대 10초) | 서버 부하 분산 |
| `retry` (mutations) | 1회 | 중복 요청 위험 최소화 |

---

## 인증 구조

NextAuth v5 (beta)를 사용하며, Kakao OAuth 소셜 로그인을 지원합니다.

```
사용자 → Kakao 로그인 버튼 클릭
            ↓
        Kakao OAuth 인증 페이지
            ↓
        리다이렉트 → NextAuth 콜백
            ↓
        JWT 토큰 발급 → 세션 생성
            ↓
        백엔드 API 호출 시 Authorization 헤더 자동 포함
```

토큰 갱신은 `features/auth/api/token.ts`에서 처리하며,
만료 시 자동으로 리프레시 토큰을 사용해 새 액세스 토큰을 발급합니다.

---

## WebView 브릿지

Android 네이티브 앱과 WebView 간 양방향 통신을 지원합니다.

### Web → Native (JS Bridge 호출)

```typescript
callBridge(
  (bridge) => bridge.openExternalBrowser(url),  // WebView: 네이티브 브라우저로 열기
  () => window.open(url, '_blank')              // 일반 브라우저: 새 탭으로 열기
);
```

### Native → Web (콜백 등록)

```typescript
registerCallback('onNativeBackPressed', () => router.back());
// → Android에서 window.onNativeBackPressed() 호출 가능
```

연동 상세 내용은 [Android WebView 연동 가이드](android-webview-integration.md)를 참고하세요.

---

## 에러 처리 전략

### 계층별 에러 처리

```
Next.js Error Boundary (app/error.tsx, app/(app)/error.tsx, app/(fullscreen)/error.tsx)
    ↓ 잡지 못한 에러
Sentry.captureException() → Sentry 대시보드
    ↓
API 에러: ApiError 클래스 + Sentry 브레드크럼 자동 기록
WebView 에러: callBridge try-catch + Sentry 태그 (source: 'webview-bridge')
결제 에러: Toss SDK 에러 + Sentry 태그 (source: 'toss-payment-*')
인증 에러: 토큰 갱신 실패 + Sentry 태그 (source: 'auth-token-refresh')
```

### Sentry 설정

- **클라이언트**: 에러 및 사용자 인터랙션 추적
- **서버**: API 라우트 및 서버 사이드 렌더링 에러 추적
- **Edge**: 미들웨어 에러 추적
- DSN 환경변수가 없으면 Sentry는 자동으로 비활성화됩니다.

---

## 테스트 전략

### 테스트 피라미드

```
         ╱  E2E  ╲               ← (향후 계획)
        ╱─────────╲
       ╱ 통합 테스트 ╲            ← Storybook play 함수
      ╱───────────────╲
     ╱  단위 + 훅 테스트 ╲        ← Vitest + RTL + MSW (190개)
    ╱─────────────────────╲
```

### 도구 구성

| 도구 | 역할 |
|------|------|
| **Vitest** | 테스트 러너 + 어서션 |
| **React Testing Library** | 컴포넌트 렌더링 + 사용자 이벤트 시뮬레이션 |
| **MSW (Mock Service Worker)** | API 모킹 (네트워크 레벨) |
| **Storybook** | 컴포넌트 시각적 문서화 + play 함수 통합 테스트 |

### 테스트 범위 (190개)

- API 레이어 테스트 (MSW 기반)
- 커스텀 훅 테스트 (`renderHook`)
- 유틸리티 함수 테스트
- 컴포넌트 렌더링 + 인터랙션 테스트
- Zustand 스토어 테스트

---

## 보안

### HTTP 보안 헤더

`next.config.mjs`에서 모든 경로에 보안 헤더를 적용합니다.

| 헤더 | 값 | 목적 |
|------|------|------|
| `X-DNS-Prefetch-Control` | `on` | DNS 프리페치 활성화 |
| `X-Frame-Options` | `SAMEORIGIN` | 클릭재킹 방지 |
| `X-Content-Type-Options` | `nosniff` | MIME 스니핑 방지 |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | 리퍼러 정보 제한 |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(self)` | 브라우저 기능 제한 |

### 환경변수 보안

- 서버 전용 변수 (`AUTH_SECRET`)는 클라이언트 번들에 포함되지 않습니다.
- t3-env가 빌드 타임에 필수 변수 누락을 감지합니다.
- `.env.example`은 값 없이 키 목록만 제공합니다.
