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
pnpm --filter @carry/e2e e2e            # 헤드리스 실행(전 project)
pnpm --filter @carry/e2e e2e:report     # HTML 리포트
# 특정 앱만: --project=customer-ui|carrier-ui|coordinator-ui|api
```

환경 오버라이드: `BACKEND_URL`, `E2E_CUSTOMER_PORT`(3100)·`E2E_CARRIER_PORT`(3001)·`E2E_COORDINATOR_PORT`(3002) 및 `*_URL`.

## CI (`.github/workflows/e2e.yml`)

라이브 백엔드 풀스택 의존이라 **일반 PR을 차단하지 않는다**. nightly(cron)·`workflow_dispatch`·`e2e` 라벨 PR에서만 실행한다(일반 PR 게이트는 `ci.yml`=Lint·Typecheck·Test·Build). 잡은 carry-platform(백엔드)을 체크아웃해 compose 인프라+bootRun을 띄우고 seed·Debezium 등록 후 Playwright를 돌린다.

> ⚠️ **선행 시크릿** `CARRY_PLATFORM_REPO_TOKEN` — carry-platform 리포 체크아웃용 PAT(repo:read). 같은 org라도 기본 `GITHUB_TOKEN`으로는 다른 private 리포를 못 받는다. 미설정 시 워크플로 RED. 최초 검증은 `workflow_dispatch`로 1회 구동 권장.

## 구조 (F4 멀티앱)

playwright.config는 3개 프론트(customer 3100·carrier 3001·coordinator 3002)를 **webServer 배열**로 자동
기동하고, 앱별 **project**가 각자 baseURL을 갖는다:

- `api` — baseURL 없음. API-level 스펙(`journey`·`two-role-journey`·`refund-journey`). `request` 컨텍스트가 `BACKEND_URL`을 직접 호출.
- `customer-ui` — customer-web(3100). `customer-ui.spec.ts` + `smoke.spec.ts`(홈 렌더).
- `carrier-ui` — carrier-web(3001). `carrier-ui.spec.ts`.
- `coordinator-ui` — coordinator-web(3002). `coordinator-ui.spec.ts`.

파일:
- `fixtures/auth.ts` — `devLogin(api, role)` + role별 토큰 주입 fixture(API-level용).
- `fixtures/ui-auth.ts` — **UI-level 인증**: carrier/coordinator는 실 dev-login 버튼 구동(`loginCarrierUI`/`loginCoordinatorUI`), customer는 NextAuth credentials 흐름으로 세션 식재(`signInCustomerUI`). customer 로그인 UI는 Kakao 전용이라 dev-login 버튼이 없다.
- `specs/smoke.spec.ts` — dev-login 4역할 토큰 획득 + customer-web 홈 렌더.
- `specs/journey.spec.ts` — **F1 핵심 여정**(라이브 v2): 인증→배송지(M-2)→주문+멱등키(M-6)→목록·상세(M-8)를 dev-login 토큰으로 실 백엔드에 관통 검증.
- `specs/{customer,carrier,coordinator}-ui.spec.ts` — **F4 UI-level 핵심경로**(브라우저로 각 앱 관통).

환경 오버라이드: `E2E_CUSTOMER_PORT`/`E2E_CARRIER_PORT`/`E2E_COORDINATOR_PORT`(및 `*_URL`).

> ⚠️ carrier/coordinator-web은 브라우저에서 직접 백엔드를 호출하므로 백엔드 CORS가 해당 origin을 허용해야 한다(carry-platform `SecurityConfig` `allowedOriginPatterns=http://localhost:[*]`).

## 핵심 여정(journey.spec) 메모

customer-web feature API가 호출하는 v2 엔드포인트를 dev-login 토큰으로 실 백엔드에 대고 관통 검증한다(단위 테스트의 msw 계약이 실 백엔드와 일치함을 증명). 자체적으로 ADMIN으로 세탁소를 등록하고 CUSTOMER로 배송지·주문을 만든다.

**우회(외부/인프라 의존)** — 라이브 불가라 건너뛴다:
- 주소검색(Naver geocode 키 부재) → 배송지 좌표·`areaCode`를 직접 주입
- 세탁소 검색 `findNearby`(로컬 postgres에 **PostGIS 확장 부재** → 500) → ADMIN `POST /v2/laundromats`로 직접 등록해 우회
- 가격 정책(로컬 시드 부재 → 404)·결제 승인(Toss PG 부재) → 여정에서 제외

**로컬 DB 주의**: Flyway local 비활성(ddl-auto:update)이라 **IDENTITY 시퀀스가 누적 데이터와 desync**되면 INSERT가 `duplicate key (id)=(1)`로 깨질 수 있다. 발생 시 `ALTER TABLE <t> ALTER COLUMN id RESTART WITH <max+1>`로 진행. 클린 볼륨에선 무관.
