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
- `specs/journey.spec.ts` — **F1 핵심 여정**(라이브 v2): 인증→배송지(M-2)→주문+멱등키(M-6)→목록·상세(M-8)를 dev-login 토큰으로 실 백엔드에 관통 검증

## 핵심 여정(journey.spec) 메모

customer-web feature API가 호출하는 v2 엔드포인트를 dev-login 토큰으로 실 백엔드에 대고 관통 검증한다(단위 테스트의 msw 계약이 실 백엔드와 일치함을 증명). 자체적으로 ADMIN으로 세탁소를 등록하고 CUSTOMER로 배송지·주문을 만든다.

**우회(외부/인프라 의존)** — 라이브 불가라 건너뛴다:
- 주소검색(Naver geocode 키 부재) → 배송지 좌표·`areaCode`를 직접 주입
- 세탁소 검색 `findNearby`(로컬 postgres에 **PostGIS 확장 부재** → 500) → ADMIN `POST /v2/laundromats`로 직접 등록해 우회
- 가격 정책(로컬 시드 부재 → 404)·결제 승인(Toss PG 부재) → 여정에서 제외

**로컬 DB 주의**: Flyway local 비활성(ddl-auto:update)이라 **IDENTITY 시퀀스가 누적 데이터와 desync**되면 INSERT가 `duplicate key (id)=(1)`로 깨질 수 있다. 발생 시 `ALTER TABLE <t> ALTER COLUMN id RESTART WITH <max+1>`로 진행. 클린 볼륨에선 무관.
