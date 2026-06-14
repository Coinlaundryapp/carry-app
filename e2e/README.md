# @carry/e2e — Playwright E2E 하네스

프론트 3앱의 풀스택 E2E 하네스(F0 F-3). 첫 smoke는 하네스 동작 증명에 집중하며, F1 이후 실제 사용자 여정(로그인→주문→…)으로 확장된다.

## 전제

1. **백엔드 풀스택**이 `BACKEND_URL`(기본 `http://localhost:8081`)에 떠 있어야 한다:
   ```bash
   # carry-platform 에서
   docker compose up -d postgres redis kafka-1 kafka-2 kafka-3
   SPRING_PROFILES_ACTIVE=local SERVER_PORT=8081 MANAGEMENT_TRACING_ENABLED=false ./gradlew :carry-app:bootRun
   ```
   dev-login(#128)으로 Kakao 없이 역할별 토큰을 발급한다.

2. **customer-web**은 Playwright `webServer`가 자동 기동한다(env 검증은 `SKIP_ENV_VALIDATION`로 우회).

## 실행

```bash
pnpm --filter @carry/e2e exec playwright install chromium   # 최초 1회
pnpm --filter @carry/e2e e2e            # 헤드리스 실행
pnpm --filter @carry/e2e e2e:report     # HTML 리포트
```

환경 오버라이드: `BACKEND_URL`, `E2E_WEB_PORT`(기본 3100), `E2E_WEB_URL`.

## 구조

- `playwright.config.ts` — webServer(customer-web)·baseURL·리포터
- `fixtures/auth.ts` — `devLogin(api, role)` + role별 토큰 주입 fixture
- `specs/smoke.spec.ts` — dev-login 4역할 토큰 획득 + customer-web 홈 렌더

## 범위 메모

현 customer-web은 v1 인증이라 smoke는 "dev-login 토큰 획득 + 홈 렌더"까지다. UI 로그인 연동(토큰 주입으로 인증 화면 진입)은 F1(customer v1→v2 마이그레이션)에서 `@carry/api`·`@carry/types`와 함께 추가한다.
