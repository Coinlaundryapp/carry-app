import { test, expect } from '@playwright/test';
import { signInCustomerUI } from '../fixtures/ui-auth';

/**
 * F4 U4-1 — customer-web **UI-level 핵심경로**.
 * U4-0에서 로그인(NextAuth dev-login) smoke부터 세운다. 주문→결제(스텁 PG)→PAID 표면은 U4-1에서 확장.
 *
 * **전제**: 백엔드 풀스택 기동(BACKEND_URL 기본 8081). customer는 브라우저 dev-login UI가 없어
 * NextAuth credentials 흐름으로 세션을 식재한 뒤 화면을 구동한다.
 */
const CUSTOMER_URL = process.env.E2E_CUSTOMER_URL ?? `http://localhost:${process.env.E2E_CUSTOMER_PORT ?? 3100}`;

test.describe('customer-web UI', () => {
  test('NextAuth dev-login 후 홈이 인증 상태로 렌더된다', async ({ page }) => {
    await signInCustomerUI(page, CUSTOMER_URL);
    const res = await page.goto('/');
    expect(res?.status()).toBeLessThan(400);
    // 인증 상태에서 홈(주문 진입 카드)이 보인다 — 미인증이면 /login으로 빠진다.
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText('일반 세탁')).toBeVisible();
  });
});
