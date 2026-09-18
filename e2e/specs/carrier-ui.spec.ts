import { test, expect, request, type APIRequestContext, type Page } from '@playwright/test';
import { devLogin, type Role } from '../fixtures/auth';
import { loginCarrierUI } from '../fixtures/ui-auth';
import { registerPwaTests } from '../fixtures/pwa';

/**
 * F4 U4-2 — carrier-web **UI-level 핵심경로**.
 *
 * 배달원이 **브라우저로** 배차를 선점하고, 선점이 사가로 배달을 만들어 '내 배달'에 뜨는 과정을
 * 실증한다: 주문은 API로 arrange(고객 소관 선행조건), carrier는 실 dev-login 버튼으로 로그인해
 * `/dispatches`에서 그 주문의 배차를 **선점(UI)** → '내 배차'·'내 배달'에서 확인한다.
 *
 * 선점은 PENDING→ACCEPTED 직행이고 DispatchAcceptedEvent로 carry-delivery 사가가 Delivery를
 * 생성한다(비동기). 수거(미디어 업로드 상태기계)는 범위 밖(후속).
 *
 * **전제**: 백엔드 풀스택 기동(BACKEND_URL 기본 8081). carrier 브라우저→백엔드는 CORS 허용 필요
 * (carry-platform #137). getAvailableDispatches는 carrier 활성 권역으로 필터하므로 GANGNAM 등록이 전제.
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

/** 기존 배송지 재사용(없으면 생성) — dev CUSTOMER 배송지 10개 상한 회피. */
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

/** ADMIN 세탁소 + CUSTOMER 주문을 만들고 orderId를 돌려준다(geocode/findNearby 우회). */
async function arrangeOrder(): Promise<number> {
  const admin = await authedContext('ADMIN');
  const customer = await authedContext('CUSTOMER');
  try {
    const laundromatRes = await admin.post('/api/v2/laundromats', {
      data: {
        name: 'E2E Carrier Wash',
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
    const addressId = await ensureAddress(customer);

    const orderRes = await customer.post('/api/v2/orders', {
      headers: { 'Idempotency-Key': `e2e-carrier-${addressId}-${laundromatId}-${Date.now()}` },
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
    return (await orderRes.json()).data.id as number;
  } finally {
    await admin.dispose();
    await customer.dispose();
  }
}

/** carrier가 GANGNAM 권역을 활성화한다(available 배차 필터 통과 전제). 이미 있으면 409 무시. */
async function ensureCarrierArea(): Promise<void> {
  const carrier = await authedContext('CARRIER');
  try {
    const res = await carrier.post('/api/v2/carrier-areas', {
      data: { areaCode: 'GANGNAM', areaName: '강남구' },
    });
    expect([201, 409], await res.text()).toContain(res.status());
  } finally {
    await carrier.dispose();
  }
}

/**
 * 해당 텍스트가 뜰 때까지 페이지를 새로고침하며 기다린다(주문→배차·선점→배달 사가 비동기).
 * 각 시도마다 5초를 실제로 대기한 뒤에만 새로고침해, 렌더 직전 reload로 끊는 레이스를 피한다.
 */
async function reloadUntilVisible(page: Page, text: string, timeoutMs = 45_000): Promise<void> {
  const start = Date.now();
  for (;;) {
    try {
      await page.getByText(text).first().waitFor({ state: 'visible', timeout: 5_000 });
      return;
    } catch {
      if (Date.now() - start > timeoutMs) {
        throw new Error(`새로고침 대기 타임아웃: "${text}" (${timeoutMs}ms)`);
      }
      await page.reload();
    }
  }
}

test.describe('carrier-web UI', () => {
  test('dev-login 버튼으로 로그인하면 authed 홈이 렌더된다', async ({ page }) => {
    await loginCarrierUI(page);
    await expect(page.getByRole('heading', { name: 'Carry 배달원' })).toBeVisible();
    await expect(page.getByRole('button', { name: '로그아웃' })).toBeVisible();
  });

  test('배차를 브라우저로 선점하면 내 배차·내 배달에 뜬다', async ({ page }) => {
    const orderId = await arrangeOrder();
    await ensureCarrierArea();

    await loginCarrierUI(page);

    // 수락 대기 목록에 그 주문의 배차가 뜰 때까지 기다린다(주문→배차 사가 비동기).
    await page.goto('/dispatches');
    await reloadUntilVisible(page, `주문 #${orderId}`);

    // 그 주문 카드의 선점 버튼을 눌러 브라우저로 선점한다.
    const card = page.locator('li', { hasText: `주문 #${orderId}` });
    await card.getByRole('button', { name: '선점' }).click();
    await expect(page.getByRole('status')).toContainText('수락');

    // '내 배차' 탭에 그 주문이 보인다.
    await page.getByRole('tab', { name: '내 배차' }).click();
    await expect(page.getByText(`주문 #${orderId}`).first()).toBeVisible();

    // 선점이 사가로 배달을 생성 → '내 배달'에 그 주문이 뜬다(비동기, 새로고침 대기).
    await page.goto('/deliveries');
    await reloadUntilVisible(page, `주문 #${orderId}`);
  });

  // 네거티브 — 미인증으로 보호 라우트 진입 시 로그인 화면으로 가드된다(거부=무변경, 비파괴).
  test('미인증으로 /dispatches 진입 시 로그인 화면으로 가드된다', async ({ page }) => {
    await page.goto('/dispatches');
    await expect(page.getByRole('button', { name: '배달원으로 로그인' })).toBeVisible();
  });
});

registerPwaTests('carrier-web');
