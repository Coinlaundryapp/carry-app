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
    timeout: 120_000,
    env: {
      SKIP_ENV_VALIDATION: '1',
      NEXT_PUBLIC_BACKEND_URL: BACKEND_URL,
      ...extraEnv,
    },
  };
}

export default defineConfig({
  testDir: './specs',
  fullyParallel: true,
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
      name: 'customer-ui',
      testMatch: /(customer-ui|smoke)\.spec\.ts$/,
      use: { ...devices['Desktop Chrome'], baseURL: CUSTOMER_URL },
    },
    {
      name: 'carrier-ui',
      testMatch: /carrier-ui\.spec\.ts$/,
      use: { ...devices['Desktop Chrome'], baseURL: CARRIER_URL },
    },
    {
      name: 'coordinator-ui',
      testMatch: /coordinator-ui\.spec\.ts$/,
      use: { ...devices['Desktop Chrome'], baseURL: COORDINATOR_URL },
    },
  ],
  webServer: [
    webServer('customer-web', CUSTOMER_PORT, CUSTOMER_URL, {
      // NextAuth(@auth/core)가 미들웨어에서 요구 — E2E 전용 더미(실 시크릿 아님).
      AUTH_SECRET: process.env.AUTH_SECRET ?? 'e2e-dummy-secret-not-for-production',
    }),
    webServer('carrier-web', CARRIER_PORT, CARRIER_URL),
    webServer('coordinator-web', COORDINATOR_PORT, COORDINATOR_URL),
  ],
});
