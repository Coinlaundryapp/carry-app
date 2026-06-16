import { test, expect, request, type APIRequestContext } from '@playwright/test';
import { devLogin, type Role } from '../fixtures/auth';
import { signInCustomerUI } from '../fixtures/ui-auth';
import { registerPwaTests } from '../fixtures/pwa';

/**
 * F4 U4-1 — customer-web **UI-level 핵심경로**.
 *
 * customer가 자기 주문을 **브라우저로 추적**하는 경로를 실증한다: NextAuth dev-login으로 세션을
 * 만들고, 주문은 API로 arrange(타 역할/외부의존 선행조건), customer-web `/status` 화면이 그 주문을
 * 실 백엔드에서 받아 렌더하는지 단언한다.
 *
 * **왜 결제는 브라우저로 안 하나**: customer-web 결제 화면은 실 Toss Payments SDK 위젯
 * (`loadTossPayments`)을 띄워 외부 Toss 서버·실 키가 필요하다. 백엔드 스텁 PG(`/payments/pay`)와
 * 다른 경로라 로컬/e2e에서 브라우저 결제는 불가하다(F1 결제 confirm 보류 known-debt). 환불 사가
 * 전 과정은 이미 API-level `refund-journey.spec.ts`가 관통 증명한다.
 *
 * **전제**: 백엔드 풀스택 기동(BACKEND_URL 기본 8081). dev-login은 role별 고정 user id라,
 * API로 arrange한 주문이 같은 CUSTOMER의 브라우저 세션에도 보인다.
 */
const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8081';
const CUSTOMER_URL = process.env.E2E_CUSTOMER_URL ?? `http://localhost:${process.env.E2E_CUSTOMER_PORT ?? 3100}`;

/** 역할 토큰으로 Authorization이 고정된 API 컨텍스트(arrange용). */
async function authedContext(role: Role): Promise<APIRequestContext> {
  const base = await request.newContext();
  const { accessToken } = await devLogin(base, role);
  await base.dispose();
  return request.newContext({
    baseURL: BACKEND_URL,
    extraHTTPHeaders: { Authorization: `Bearer ${accessToken}` },
  });
}

/** ADMIN 세탁소 + CUSTOMER 배송지·주문을 API로 만들고 orderId를 돌려준다(geocode/findNearby 우회). */
async function arrangeOrder(): Promise<number> {
  const admin = await authedContext('ADMIN');
  const customer = await authedContext('CUSTOMER');
  try {
    const laundromatRes = await admin.post('/api/v2/laundromats', {
      data: {
        name: 'E2E UI Wash',
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

    // 배송지는 dev CUSTOMER(고정 id)에 누적되고 최대 10개 상한이 있다. 반복 실행에서 상한에
    // 막히지 않도록 기존 배송지가 있으면 재사용하고, 없을 때만 생성한다(geocode 우회: 좌표 직접 주입).
    const listRes = await customer.get('/api/v2/shipping-addresses');
    expect(listRes.ok(), await listRes.text()).toBeTruthy();
    const existing = (await listRes.json()).data as Array<{ id: number }>;
    let addressId: number;
    if (existing.length > 0) {
      addressId = existing[0].id;
    } else {
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
      addressId = (await addrRes.json()).data.id as number;
    }

    const orderRes = await customer.post('/api/v2/orders', {
      headers: { 'Idempotency-Key': `e2e-ui-${addressId}-${laundromatId}-${Date.now()}` },
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

test.describe('customer-web UI', () => {
  test('NextAuth dev-login 후 홈이 인증 상태로 렌더된다', async ({ page }) => {
    await signInCustomerUI(page, CUSTOMER_URL);
    const res = await page.goto('/');
    expect(res?.status()).toBeLessThan(400);
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText('일반 세탁')).toBeVisible();
  });

  test('내 세탁 현황(/status)에서 API로 만든 주문을 브라우저로 확인한다', async ({ page }) => {
    const orderId = await arrangeOrder();

    await signInCustomerUI(page, CUSTOMER_URL);
    await page.goto('/status');

    // 주문이 있으면 "내 세탁 현황" 헤딩 + 주문번호 카드가 렌더된다(빈 상태 문구가 아니다).
    await expect(page.getByText('내 세탁 현황')).toBeVisible();
    await expect(page.getByText(`주문번호 ${orderId}`)).toBeVisible();
  });

  // customer 심화 — 로그인 화면이 카카오 로그인 안내·버튼으로 렌더된다(read-only, 비파괴).
  // (customer는 미들웨어 하드 가드가 아니라 클라이언트가 인증을 처리하는 모델이라, 보호 라우트
  //  리다이렉트 대신 로그인 UI 자체의 렌더를 검증한다.)
  test('로그인 화면이 카카오 로그인 안내·버튼으로 렌더된다', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('코인세탁소에서 더이상 기다릴 필요 없이')).toBeVisible();
    await expect(page.getByText('카카오로 시작하기').first()).toBeVisible();
  });
});

registerPwaTests('customer-web');
