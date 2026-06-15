import { type Page, expect } from '@playwright/test';

/**
 * UI-level 인증 헬퍼 (F4).
 *
 * 앱마다 인증 모델이 다르다([[carry-frontend-completion-roadmap]] 인증 모델):
 *  - **carrier/coordinator**: dev-login 전용 내부툴. 로그인 화면에 실 dev-login 버튼이 있으므로
 *    **그 버튼을 그대로 구동**한다(가장 충실 — 토큰 주입 우회 없음). 토큰은 앱의 localStorage
 *    tokenStore가 소유한다.
 *  - **customer**: 브라우저 로그인 UI는 Kakao 전용(dev-login 버튼 없음). dev-login은 NextAuth
 *    Credentials(`devRole`)에만 배선돼 있어, NextAuth csrf+callback 흐름으로 세션 쿠키를 식재한다.
 *    인증 부트스트랩만 API로 하고, 이후 주문·결제 화면은 브라우저로 구동한다.
 */

/** carrier-web 로그인 — 실 dev-login 버튼 구동 후 authed 홈 도달까지 대기. */
export async function loginCarrierUI(page: Page): Promise<void> {
  await page.goto('/login');
  await page.getByRole('button', { name: '배달원으로 로그인' }).click();
  // authed 홈에만 있는 로그아웃 버튼으로 로그인 완료를 단언(홈 h1은 로그인 화면과 동일 문구라 부적합).
  await expect(page.getByRole('button', { name: '로그아웃' })).toBeVisible();
}

/** coordinator-web 로그인 — 역할(COORDINATOR/ADMIN) 선택 후 dev-login 버튼 구동. */
export async function loginCoordinatorUI(
  page: Page,
  role: 'COORDINATOR' | 'ADMIN' = 'COORDINATOR',
): Promise<void> {
  await page.goto('/login');
  if (role === 'ADMIN') {
    await page.getByRole('radio', { name: '관리자' }).click();
  }
  await page.getByRole('button', { name: '로그인' }).click();
  await expect(page.getByRole('button', { name: '로그아웃' })).toBeVisible();
}

/**
 * customer-web 로그인 — NextAuth Credentials dev-login(`devRole=CUSTOMER`)으로 세션 쿠키 식재.
 * 브라우저에 dev-login UI가 없어 csrf+callback을 직접 호출한다(같은 dev-login 메커니즘).
 * 이후 page는 인증된 세션으로 customer 화면을 구동할 수 있다.
 */
export async function signInCustomerUI(page: Page, baseURL: string): Promise<void> {
  const ctx = page.context();
  const csrfRes = await ctx.request.get(`${baseURL}/api/auth/csrf`);
  expect(csrfRes.ok(), `csrf 발급 실패: ${csrfRes.status()}`).toBeTruthy();
  const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };

  const res = await ctx.request.post(`${baseURL}/api/auth/callback/credentials`, {
    form: { csrfToken, devRole: 'CUSTOMER', callbackUrl: '/', json: 'true' },
  });
  // NextAuth는 성공 시 세션 쿠키를 Set-Cookie로 내린다(2xx/3xx). 4xx면 인증 실패.
  expect(res.status(), `customer dev-login 실패: ${res.status()} ${await res.text()}`).toBeLessThan(400);
}
