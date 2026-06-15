import { test, expect } from '@playwright/test';
import { loginCarrierUI } from '../fixtures/ui-auth';

/**
 * F4 U4-2 — carrier-web **UI-level 핵심경로**.
 * U4-0에서 로그인 smoke부터 세운다(하네스 동작 증명). 배차 선점→수거→상태기계는 U4-2에서 확장.
 *
 * **전제**: 백엔드 풀스택 기동(BACKEND_URL 기본 8081). 로그인은 실 dev-login 버튼을 구동한다.
 */
test.describe('carrier-web UI', () => {
  test('dev-login 버튼으로 로그인하면 authed 홈이 렌더된다', async ({ page }) => {
    await loginCarrierUI(page);
    await expect(page.getByRole('heading', { name: 'Carry 배달원' })).toBeVisible();
    await expect(page.getByRole('button', { name: '로그아웃' })).toBeVisible();
  });
});
