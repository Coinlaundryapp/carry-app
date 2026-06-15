import { test, expect } from '@playwright/test';
import { loginCoordinatorUI } from '../fixtures/ui-auth';

/**
 * F4 U4-3 — coordinator-web **UI-level 핵심경로**.
 * U4-0에서 로그인 smoke부터 세운다. 주문 취소→환불 표면·ADMIN 가드는 U4-3에서 확장.
 *
 * **전제**: 백엔드 풀스택 기동(BACKEND_URL 기본 8081). 로그인은 실 dev-login 버튼을 구동한다.
 */
test.describe('coordinator-web UI', () => {
  test('COORDINATOR로 로그인하면 운영 허브가 렌더된다', async ({ page }) => {
    await loginCoordinatorUI(page, 'COORDINATOR');
    await expect(page.getByRole('heading', { name: '코디네이터 운영' })).toBeVisible();
    await expect(page.getByRole('link', { name: /주문 운영/ })).toBeVisible();
    // COORDINATOR엔 ADMIN 전용 운영 대시보드 메뉴가 보이지 않는다(role 가드).
    await expect(page.getByRole('link', { name: /운영 대시보드/ })).toHaveCount(0);
  });

  test('ADMIN으로 로그인하면 운영 대시보드 메뉴가 노출된다', async ({ page }) => {
    await loginCoordinatorUI(page, 'ADMIN');
    await expect(page.getByRole('link', { name: /운영 대시보드/ })).toBeVisible();
  });
});
