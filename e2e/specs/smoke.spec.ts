import { test, expect, devLogin, type Role } from '../fixtures/auth';
import { request } from '@playwright/test';

/**
 * F-3 하네스 부트스트랩 smoke.
 * 목적은 "하네스가 실제로 동작함"의 증명 — ①Playwright 기동 ②dev-login 픽스처가 백엔드에서
 * 역할별 토큰 획득 ③customer-web 홈 렌더. (UI 로그인 연동·인증 화면은 F1)
 */

const ROLES: Role[] = ['CUSTOMER', 'CARRIER', 'COORDINATOR', 'ADMIN'];

test.describe('dev-login 픽스처', () => {
  for (const role of ROLES) {
    test(`${role} 토큰을 발급받는다`, async () => {
      const api = await request.newContext();
      const tokens = await devLogin(api, role);

      expect(tokens.accessToken).toBeTruthy();
      expect(tokens.refreshToken).toBeTruthy();
      // access 토큰 payload의 role 클레임이 요청 역할과 일치
      const payload = JSON.parse(Buffer.from(tokens.accessToken.split('.')[1], 'base64url').toString());
      expect(payload.role).toBe(role);

      await api.dispose();
    });
  }
});

test.describe('customer-web', () => {
  test('홈 페이지가 렌더된다', async ({ page }) => {
    const res = await page.goto('/');
    expect(res?.status()).toBeLessThan(400);
    await expect(page.locator('body')).toBeVisible();
  });
});
