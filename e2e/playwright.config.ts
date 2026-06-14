import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

/**
 * carry 프론트 E2E 하네스.
 *
 * **전제(별도 기동)**: 백엔드 풀스택이 `BACKEND_URL`(기본 http://localhost:8081)에 떠 있어야 한다
 * (carry-platform: docker + `SPRING_PROFILES_ACTIVE=local ./gradlew :carry-app:bootRun`).
 * dev-login 픽스처가 이 백엔드의 `POST /api/v2/auth/dev-login`으로 역할별 토큰을 발급한다.
 *
 * customer-web은 webServer가 자동 기동한다(env 검증은 SKIP_ENV_VALIDATION로 우회 — 하네스 부트스트랩
 * 목적이라 NAVER/KAKAO/TOSS 키 불요). 현 customer-web은 v1 인증이라 smoke는 "dev-login 토큰 획득 +
 * 홈 렌더" 수준까지(UI 로그인 연동은 F1).
 */
const WEB_PORT = Number(process.env.E2E_WEB_PORT ?? 3100);
const WEB_URL = process.env.E2E_WEB_URL ?? `http://localhost:${WEB_PORT}`;
const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8081';

export default defineConfig({
  testDir: './specs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: WEB_URL,
    trace: 'on-first-retry',
    extraHTTPHeaders: {},
  },
  // dev-login 픽스처가 사용할 백엔드 주소를 메타데이터로 전달.
  metadata: { backendUrl: BACKEND_URL },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // Next는 PORT env를 따른다 — pnpm `--` 인자 포워딩 quirk를 피해 env로 포트를 지정한다.
    command: `pnpm --filter customer-web dev`,
    cwd: path.resolve(__dirname, '..'),
    url: WEB_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      PORT: String(WEB_PORT),
      SKIP_ENV_VALIDATION: '1',
      NEXT_PUBLIC_BACKEND_URL: BACKEND_URL,
      // NextAuth(@auth/core)가 미들웨어에서 요구 — E2E 전용 더미(실 시크릿 아님).
      AUTH_SECRET: process.env.AUTH_SECRET ?? 'e2e-dummy-secret-not-for-production',
    },
  },
});
