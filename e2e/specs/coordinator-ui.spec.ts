import { test, expect, request, type APIRequestContext, type Page } from '@playwright/test';
import { devLogin, type Role } from '../fixtures/auth';
import { loginCoordinatorUI } from '../fixtures/ui-auth';

/**
 * F4 U4-3 — coordinator-web **UI-level 핵심경로**.
 *
 * 코디네이터가 **브라우저로** 결제 완료(PAID) 주문을 취소해 환불 보상 사가를 구동하고, 주문이
 * 환불완료(REFUNDED)에 이르는 과정을 실증한다. PAID 주문은 API로 arrange(고객·배달원 소관 전 사가:
 * 주문→선점→수거→인보이스→스텁 PG 결제), 코디는 실 dev-login으로 로그인해 `/orders` 상세에서
 * **취소(UI)** → 환불 표면을 확인한다. ADMIN role 가드(`/admin` 대시보드)도 함께 검증한다.
 *
 * 환불은 비동기(markRefundPending → RefundRetrySweeper → REFUNDED)라 새로고침으로 대기한다.
 * 로컬 기동 시 `CARRY_PAYMENT_REFUND_RETRY_INTERVAL_MS`를 낮춰 가속한다.
 *
 * **전제**: 백엔드 풀스택 기동(BACKEND_URL 기본 8081, local 프로파일=스텁 PG). coordinator 브라우저→
 * 백엔드는 CORS 허용 필요(carry-platform #137).
 */
const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8081';

async function authedContext(role: Role): Promise<APIRequestContext> {
  const base = await request.newContext();
  const { accessToken } = await devLogin(base, role);
  await base.dispose();
  return request.newContext({
    baseURL: BACKEND_URL,
    extraHTTPHeaders: { Authorization: `Bearer ${accessToken}` },
  });
}

async function poll<T>(
  label: string,
  fn: () => Promise<T | null | undefined>,
  timeoutMs = 60_000,
  intervalMs = 1_000,
): Promise<T> {
  const start = Date.now();
  for (;;) {
    const result = await fn();
    if (result != null) return result;
    if (Date.now() - start > timeoutMs) throw new Error(`polling 타임아웃(${label}, ${timeoutMs}ms)`);
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

async function ensureAddress(customer: APIRequestContext): Promise<number> {
  const listRes = await customer.get('/api/v2/shipping-addresses');
  expect(listRes.ok(), await listRes.text()).toBeTruthy();
  const existing = (await listRes.json()).data as Array<{ id: number }>;
  if (existing.length > 0) return existing[0].id;
  const addrRes = await customer.post('/api/v2/shipping-addresses', {
    data: {
      alias: 'home',
      roadAddress: 'Seoul Gangnam Teheran-ro 123',
      detailAddress: '101-202',
      zipCode: '06234',
      latitude: 37.5065,
      longitude: 127.0536,
      recipientName: 'Hong',
      recipientPhone: '010-1234-5678',
      entranceInfo: 'pw 1234',
      areaCode: 'GANGNAM',
    },
  });
  expect(addrRes.status(), await addrRes.text()).toBe(201);
  return (await addrRes.json()).data.id as number;
}

async function uploadPhoto(carrier: APIRequestContext, name: string): Promise<number> {
  const res = await carrier.post('/api/v2/media/upload/delivery', {
    multipart: { file: { name, mimeType: 'image/jpeg', buffer: Buffer.from(`fake-${name}`) } },
  });
  expect(res.status(), await res.text()).toBe(201);
  return (await res.json()).data.id as number;
}

/** 주문→선점→수거→인보이스→스텁 PG 결제까지 API로 진행해 **PAID 주문**의 id를 돌려준다. */
async function arrangePaidOrder(): Promise<number> {
  const admin = await authedContext('ADMIN');
  const customer = await authedContext('CUSTOMER');
  const carrier = await authedContext('CARRIER');
  try {
    const laundromatRes = await admin.post('/api/v2/laundromats', {
      data: {
        name: 'E2E Coord Wash',
        roadAddress: 'Seoul Gangnam Teheran-ro 200',
        detailAddress: '2F',
        zipCode: '06234',
        latitude: 37.5065,
        longitude: 127.0536,
        options: ['WASHING_MACHINE', 'DRYER'],
      },
    });
    expect(laundromatRes.status(), await laundromatRes.text()).toBe(201);
    const laundromatId = (await laundromatRes.json()).data.id as number;

    const meRes = await customer.get('/api/v2/users/me');
    expect(meRes.ok()).toBeTruthy();
    const customerId = (await meRes.json()).data.id as number;
    const addressId = await ensureAddress(customer);

    const orderRes = await customer.post('/api/v2/orders', {
      headers: { 'Idempotency-Key': `e2e-coord-${addressId}-${laundromatId}-${Date.now()}` },
      data: {
        shippingAddressId: addressId,
        laundromatId,
        laundryItemType: 'REGULAR',
        selectedOptions: [
          { optionType: 'WASH', subOptionType: 'STANDARD' },
          { optionType: 'DRY', subOptionType: 'LOW_HEAT' },
        ],
        desiredPickupAt: '2026-06-20T10:00:00Z',
        desiredDeliveryAt: '2026-06-22T18:00:00Z',
      },
    });
    expect(orderRes.status(), await orderRes.text()).toBe(201);
    const orderId = (await orderRes.json()).data.id as number;

    const areaRes = await carrier.post('/api/v2/carrier-areas', {
      data: { areaCode: 'GANGNAM', areaName: '강남구' },
    });
    expect([201, 409], await areaRes.text()).toContain(areaRes.status());

    const dispatchId = await poll('available 배차', async () => {
      const res = await carrier.get('/api/v2/dispatches/available?size=50');
      if (!res.ok()) return null;
      const list = (await res.json()).data as Array<{ id: number; orderId: number }>;
      return list.find((d) => d.orderId === orderId)?.id ?? null;
    });
    const claimRes = await carrier.post(`/api/v2/dispatches/${dispatchId}/claim`);
    expect(claimRes.status(), await claimRes.text()).toBe(200);

    const delivery = await poll('생성된 배달', async () => {
      const res = await carrier.get('/api/v2/deliveries/my?size=50');
      if (!res.ok()) return null;
      const list = (await res.json()).data as Array<{ id: number; orderId: number }>;
      return list.find((d) => d.orderId === orderId) ?? null;
    });

    const pickupRes = await carrier.post(`/api/v2/deliveries/${delivery.id}/pickup`, {
      data: {
        weight: 3.5,
        photoIds: [await uploadPhoto(carrier, 'pickup.jpg')],
        customerId,
        laundryItemType: 'REGULAR',
        orderUnitType: 'UNKNOWN',
        orderRequestType: 'UNKNOWN',
        selectedOptions: [],
      },
    });
    expect(pickupRes.status(), await pickupRes.text()).toBe(200);

    await poll('발행된 인보이스', async () => {
      const res = await customer.get(`/api/v2/payments/${orderId}/invoice`);
      return res.ok() ? (await res.json()).data : null;
    });

    const payRes = await customer.post(`/api/v2/payments/pay?orderId=${orderId}`, {
      headers: { 'Idempotency-Key': `e2e-coord-pay-${orderId}` },
      data: { pgProvider: 'TOSS_PAYMENTS', paymentKey: `stub-${orderId}` },
    });
    expect(payRes.status(), await payRes.text()).toBe(201);

    await poll('주문 PAID', async () => {
      const res = await customer.get(`/api/v2/orders/${orderId}`);
      if (!res.ok()) return null;
      return (await res.json()).data.status === 'PAID' ? true : null;
    });

    return orderId;
  } finally {
    await admin.dispose();
    await customer.dispose();
    await carrier.dispose();
  }
}

/** 상세 페이지를 새로고침하며 "상태" 행이 기대 라벨이 될 때까지 기다린다(환불 사가 비동기). */
async function reloadUntilStatus(page: Page, label: string, timeoutMs = 60_000): Promise<void> {
  const start = Date.now();
  for (;;) {
    try {
      await page.getByText(label, { exact: true }).first().waitFor({ state: 'visible', timeout: 5_000 });
      return;
    } catch {
      if (Date.now() - start > timeoutMs) throw new Error(`상태 대기 타임아웃: "${label}" (${timeoutMs}ms)`);
      await page.reload();
    }
  }
}

test.describe('coordinator-web UI', () => {
  test('COORDINATOR로 로그인하면 운영 허브가 렌더된다', async ({ page }) => {
    await loginCoordinatorUI(page, 'COORDINATOR');
    await expect(page.getByRole('heading', { name: '코디네이터 운영' })).toBeVisible();
    await expect(page.getByRole('link', { name: /주문 운영/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /운영 대시보드/ })).toHaveCount(0);
  });

  test('ADMIN으로 로그인하면 운영 대시보드 메뉴·화면이 렌더된다', async ({ page }) => {
    await loginCoordinatorUI(page, 'ADMIN');
    await expect(page.getByRole('link', { name: /운영 대시보드/ })).toBeVisible();
    await page.getByRole('link', { name: /운영 대시보드/ }).click();
    await expect(page.getByRole('heading', { name: '운영 대시보드 (ADMIN)' })).toBeVisible();
  });

  test('PAID 주문을 브라우저로 취소하면 환불 보상이 진행돼 환불완료가 된다', async ({ page }) => {
    const orderId = await arrangePaidOrder();

    // window.prompt(취소 사유)를 수락한다.
    page.on('dialog', (dialog) => dialog.accept('E2E 환불 보상 검증'));

    await loginCoordinatorUI(page, 'COORDINATOR');

    // 주문 운영(기본 PAID 필터)에서 그 주문 상세로 진입한다.
    await page.goto(`/orders/${orderId}`);
    await expect(page.getByRole('heading', { name: `주문 #${orderId}` })).toBeVisible();
    await expect(page.getByText('결제완료', { exact: true })).toBeVisible();

    // 취소(환불 보상) → notice + 환불 보상 사가 시작.
    await page.getByRole('button', { name: /주문 취소 \(환불 보상\)/ }).click();
    await expect(page.getByRole('status')).toContainText('환불 보상');

    // 환불 보상 사가 완료까지 새로고침 대기 → 상태가 환불완료(REFUNDED)가 된다.
    await reloadUntilStatus(page, '환불완료');
  });

  // 네거티브 — 미인증으로 보호 라우트 진입 시 로그인 화면으로 가드된다(거부=무변경, 비파괴).
  test('미인증으로 /orders 진입 시 로그인 화면으로 가드된다', async ({ page }) => {
    await page.goto('/orders/1');
    await expect(page.getByRole('button', { name: '로그인' })).toBeVisible();
  });
});
