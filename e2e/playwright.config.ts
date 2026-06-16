import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

/**
 * carry 프론트 E2E 하네스 (F4 멀티앱).
 *
 * **전제(별도 기동)**: 백엔드 풀스택이 `BACKEND_URL`(기본 http://localhost:8081)에 떠 있어야 한다
 * (carry-platform: docker + `SPRING_PROFILES_ACTIVE=local ./gradlew :carry-app:bootRun`).
 * dev-login 픽스처가 이 백엔드의 `POST /api/v2/auth/dev-login`으로 역할별 토큰을 발급한다.
 *
 * **3 webServer**: F4부터 customer뿐 아니라 carrier·coordinator도 자동 기동해 UI-level 여정을
 * 브라우저로 관통한다. 앱별 Playwright **project**가 각자 baseURL을 갖고, testMatch로 스펙을 가른다:
 *   - `api`         : baseURL 없음. 기존 API-level 스펙(journey·two-role·refund·smoke).
 *   - `customer-ui` : customer-web(3100) UI 핵심경로.
 *   - `carrier-ui`  : carrier-web(3001) UI 핵심경로.
 *   - `coordinator-ui`: coordinator-web(3002) UI 핵심경로.
 */
const CUSTOMER_PORT = Number(process.env.E2E_CUSTOMER_PORT ?? 3100);
const CARRIER_PORT = Number(process.env.E2E_CARRIER_PORT ?? 3001);
const COORDINATOR_PORT = Number(process.env.E2E_COORDINATOR_PORT ?? 3002);

const CUSTOMER_URL = process.env.E2E_CUSTOMER_URL ?? `http://localhost:${CUSTOMER_PORT}`;
const CARRIER_URL = process.env.E2E_CARRIER_URL ?? `http://localhost:${CARRIER_PORT}`;
const COORDINATOR_URL = process.env.E2E_COORDINATOR_URL ?? `http://localhost:${COORDINATOR_PORT}`;
const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8081';

/** Next dev 서버를 앱별 포트로 띄운다(스크립트의 고정 `-p`를 우회하려 exec로 직접 호출). */
function webServer(appDir: string, port: number, url: string, extraEnv: Record<string, string> = {}) {
  return {
    command: `pnpm --filter ${appDir} exec next dev -p ${port}`,
    cwd: path.resolve(__dirname, '..'),
    url,
    reuseExistingServer: !process.env.CI,
    // Next dev 콜드스타트(Sentry/OpenTelemetry 인스트루멘테이션 컴파일 포함)가 무거워 120s로는
    // 부족할 수 있다(customer-web 특히). 느린 CI 러너의 거짓 타임아웃을 막으려 넉넉히 둔다.
    timeout: 240_000,
    env: {
      SKIP_ENV_VALIDATION: '1',
      NEXT_PUBLIC_BACKEND_URL: BACKEND_URL,
      ...extraEnv,
    },
  };
}

export default defineConfig({
  testDir: './specs',
  // ⚠️ 라이브 사가 통합 E2E라 **직렬 실행**한다. 모든 스펙이 고정 id dev 유저를 공유하고 같은
  // available 배차를 선점·주문을 생성하므로, 병렬이면 ①배차 선점 경합 ②유저별 상한(배송지 10개)
  // ③3개 Next dev 서버 동시 부하로 인한 goto 타임아웃이 발생한다. 격리 가능한 단위가 아니다.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    trace: 'on-first-retry',
  },
  // dev-login 픽스처가 사용할 백엔드 주소를 메타데이터로 전달.
  metadata: { backendUrl: BACKEND_URL },
  projects: [
    {
      // 기존 API-level 스펙 — baseURL 불요(request 컨텍스트가 BACKEND_URL을 직접 잡는다).
      name: 'api',
      testMatch: /(journey|two-role-journey|refund-journey)\.spec\.ts$/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      // smoke는 customer 홈을 렌더하므로 customer baseURL이 필요 → customer-ui와 한 project.
      // customer는 모바일 웹앱(설치형 PWA)이라 모바일 디바이스(뷰포트·터치·UA)로 검증한다.
      name: 'customer-ui',
      testMatch: /(customer-ui|smoke)\.spec\.ts$/,
      use: { ...devices['Pixel 5'], baseURL: CUSTOMER_URL },
    },
    {
      // carrier도 모바일 웹앱(설치형 PWA) → 모바일 디바이스로 검증.
      name: 'carrier-ui',
      testMatch: /carrier-ui\.spec\.ts$/,
      use: { ...devices['Pixel 5'], baseURL: CARRIER_URL },
    },
    {
      // coordinator는 데스크톱(운영 대시보드)이라 Desktop Chrome 유지.
      name: 'coordinator-ui',
      testMatch: /coordinator-ui\.spec\.ts$/,
      use: { ...devices['Desktop Chrome'], baseURL: COORDINATOR_URL },
    },
  ],
  webServer: [
    webServer('customer-web', CUSTOMER_PORT, CUSTOMER_URL, {
      // NextAuth(@auth/core)가 미들웨어에서 요구 — E2E 전용 더미(실 시크릿 아님).
      AUTH_SECRET: process.env.AUTH_SECRET ?? 'e2e-dummy-secret-not-for-production',
      // ⚠️ customer-web env 검증(@t3-oss/env-nextjs)은 SKIP_ENV_VALIDATION을 서버에서만 본다
      // (NEXT_PUBLIC_ 접두사가 없어 클라이언트 번들에 인라인 안 됨). 클라이언트 hydration 시
      // 검증이 다시 돌아 NEXT_PUBLIC_* 키 부재로 throw → 페이지 blank. E2E 전용 더미로 채운다
      // (Kakao/Naver/Toss 실 기능은 외부 의존이라 e2e에서 구동 안 함).
      NEXT_PUBLIC_NAVER_ID: 'e2e-naver-id',
      NEXT_PUBLIC_KAKAO_REST_API_KEY: 'e2e-kakao-rest-key',
      NEXT_PUBLIC_KAKAO_REDIRECT_URL: `${CUSTOMER_URL}/api/kakao`,
      NEXT_PUBLIC_TOSS_CLIENT_KEY: 'test_ck_e2e_dummy',
    }),
    webServer('carrier-web', CARRIER_PORT, CARRIER_URL),
    webServer('coordinator-web', COORDINATOR_PORT, COORDINATOR_URL),
  ],
});
