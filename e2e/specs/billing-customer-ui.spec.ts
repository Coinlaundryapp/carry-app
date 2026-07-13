import { test, expect, request, type APIRequestContext } from '@playwright/test';
import { devLogin, type Role } from '../fixtures/auth';
import { signInCustomerUI } from '../fixtures/ui-auth';

/**
 * F12 — customer-web **빌링키(자동결제) UI 여정**.
 *
 * F4까지 customer-web 결제 화면은 실 Toss Payments SDK 위젯이라 브라우저로 결제를 구동할 수
 * 없었다(customer-ui.spec.ts 상단 주석). 빌링키 재설계(F1~F11)로 카드 등록이 **목 폼**(카드사
 * 드롭다운 + 카드번호 형식검증만 하는 로컬 검증, 실제로는 임의 authKey 전송)이 되면서 카드 등록만은
 * 브라우저로 구동 가능해졌다 — 이 스펙이 그 최초 커버리지다.
 *
 * **여전히 API로 arrange하는 부분**: 주문 생성 자체는 세탁소 선택에 실 카카오/네이버 지도·geocode가
 * 필요해(외부 의존, customer-ui.spec.ts와 동일한 이유) 브라우저 퍼널을 관통하지 않는다. 기존 UI 스펙과
 * 동일하게 주문은 `request` 컨텍스트로 arrange하고, **새로 생긴 빌링키 UI**(등록 시트·상태 배지·연체
 * 화면)만 브라우저로 검증한다.
 *
 * **이 스펙이 실증하는 새 백엔드 계약**: 인보이스 발행(수거 완료 후) 시점에 등록된 빌링키로 **자동
 * 과금**된다 — `PaymentSagaHandler.onInvoiceIssued`가 `InvoiceIssuedEvent`(Kafka 자체 소비)를 받아
 * `AutoChargeService.attemptCharge`를 즉시 구동하므로 폴링 몇 초~수십 초면 COMPLETED에 도달한다.
 * `PaymentController`에는 더 이상 수동 `/payments/pay`가 없다(환불 스펙 refund-journey.spec.ts·
 * coordinator-ui.spec.ts가 여전히 그 엔드포인트를 호출하는데, 빌링키 재설계로 이미 제거된 것으로
 * 보인다 — 이 스펙과 무관한 기존 스펙의 회귀이니 별도 확인 필요). 결제 완료는 customer-web
 * `/status/{id}` 배지("결제 완료")로 관찰한다.
 *
 * **연체(OVERDUE) 실패 경로를 다루지 않는 이유**: 스텁 PG(`StubPgProviderAdapter`, local 프로파일)의
 * 과금 실패 마커는 **billingKey 값**이 "fail-"로 시작해야 트리거되는데, 그 billingKey는
 * `STUB-BILLKEY-${customerKey}`로 서버가 내부 생성한 UUID 기반 값이라 공개 API로는 만들어낼 수 없다
 * (`authKey`가 "fail-"로 시작하면 그건 **등록 자체**가 400으로 거부될 뿐이라 빌링키가 저장되지 않는다).
 * 설령 등록에 성공한 빌링키로 과금을 실패시킬 수 있어도, `ChargeRetrySweeper`(기본 10분 주기, 첫 재시도
 * 백오프 1시간)·`OverdueSweeper`(기본 1시간 주기, 72시간 임계)가 모두 실 스케줄 기본값이라 e2e
 * 폴링 윈도(60~120s)로는 도달 불가능하다(백엔드 자체 통합테스트도 `payment_invoices.created_at`을
 * SQL로 73시간 백데이트한 뒤 스위퍼 메서드를 직접 호출해서만 검증한다 — carry-app
 * AutoChargeSagaIntegrationTest). 연체 화면(OverdueResolution) 자체의 UI 렌더는 이미 컴포넌트
 * 단위테스트(OverdueResolution.test.tsx)가 검증하므로 e2e 중복 없이 생략한다.
 *
 * **전제**: 백엔드 풀스택 기동(local 프로파일=스텁 PG, BACKEND_URL 기본 8081) + Kafka + LocalStack.
 * dev CUSTOMER는 고정 id라 배송지/빌링키가 반복 실행에 누적된다 — 있으면 재사용, 없으면 생성한다.
 */
const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8081';
const CUSTOMER_URL = process.env.E2E_CUSTOMER_URL ?? `http://localhost:${process.env.E2E_CUSTOMER_PORT ?? 3100}`;

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

/** authKey로 빌링키를 등록한다(목 PG: authKey 문자열을 그대로 수용). */
async function registerBillingKeyApi(customer: APIRequestContext, authKey: string): Promise<void> {
  const res = await customer.post('/api/v2/billing-keys', {
    headers: { 'Idempotency-Key': `e2e-bk-${authKey}` },
    data: { authKey },
  });
  expect(res.status(), await res.text()).toBe(201);
}

/** ADMIN 세탁소 + CUSTOMER 배송지·주문을 API로 만들고 orderId를 돌려준다(geocode/findNearby 우회). */
async function arrangeOrder(admin: APIRequestContext, customer: APIRequestContext): Promise<number> {
  const laundromatRes = await admin.post('/api/v2/laundromats', {
    data: {
      name: 'E2E Billing Wash',
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
    headers: { 'Idempotency-Key': `e2e-billing-${addressId}-${laundromatId}-${Date.now()}` },
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
}

/** 주문을 선점→수거 완료까지 진행해 인보이스 발행을 유발한다(자동과금의 트리거). */
async function pickupOrder(carrier: APIRequestContext, customer: APIRequestContext, orderId: number, customerId: number): Promise<void> {
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
}

test.describe('customer-web 빌링키 자동결제 여정', () => {
  // 주문→배차→수거→인보이스 발행→자동과금(스위퍼 개입 없이 즉시)까지라 넉넉히.
  test.setTimeout(180_000);

  test('마이>결제수단에서 카드를 목 등록하면 마스킹 정보가 표시된다', async ({ page }) => {
    await signInCustomerUI(page, CUSTOMER_URL);
    await page.goto('/my/payment');
    // TopNavigation title(<p>)과 MyCardSection heading(<h2>) 둘 다 "결제수단" 텍스트라
    // getByText면 2개 매치로 strict-mode 위반 — heading role로 특정한다.
    await expect(page.getByRole('heading', { name: '결제수단' })).toBeVisible();

    // 반복 실행 대비: 기존 등록 카드가 있으면 "변경", 없으면 "카드 등록" 버튼이 보인다.
    // 어느 쪽이든 같은 등록 시트를 연다.
    const registerBtn = page.getByRole('button', { name: '카드 등록', exact: true });
    const changeBtn = page.getByRole('button', { name: '변경' });
    if (await changeBtn.isVisible().catch(() => false)) {
      await changeBtn.click();
    } else {
      await registerBtn.click();
    }

    // 시트가 열렸다 — 드롭다운 placeholder는 시트 안에만 있어 트리거 버튼 텍스트와 겹치지 않는다.
    await expect(page.getByText('카드사 선택')).toBeVisible();
    await page.getByText('카드사 선택').click();
    await page.getByRole('option', { name: '신한카드' }).click();
    await page.getByPlaceholder('16자리 숫자를 입력하세요').fill('1234567812345678');
    // 미등록 분기라면 "카드 등록" 라벨 버튼이 (마이페이지 트리거 + 시트 내 제출) 2개 동시 존재한다.
    // 시트는 body 끝에 포털 렌더되어 DOM상 항상 뒤에 오므로 .last()가 제출 버튼을 가리킨다.
    await page.getByRole('button', { name: '카드 등록', exact: true }).last().click();

    // 목 등록 성공 — 백엔드가 내려준 카드사/마스킹 정보가 렌더된다(입력한 카드사와 무관, 스텁이 생성).
    await expect(page.getByText('카드가 등록되었습니다')).toBeVisible();

    // 성공 표시 지연(1.2s) 후 시트가 닫히고 요약이 갱신된다.
    await expect(page.getByRole('button', { name: '변경' })).toBeVisible({ timeout: 5_000 });
  });

  test('빌링키 등록 후 수거 완료 시 자동과금되어 상태 화면에 결제 완료가 뜬다', async ({ page }) => {
    const admin = await authedContext('ADMIN');
    const customer = await authedContext('CUSTOMER');
    const carrier = await authedContext('CARRIER');
    try {
      // ── 0. 빌링키 arrange(정상 authKey — 목 PG는 authKey를 그대로 수용) ──
      await registerBillingKeyApi(customer, `e2e-auto-${Date.now()}`);

      const meRes = await customer.get('/api/v2/users/me');
      expect(meRes.ok()).toBeTruthy();
      const customerId = (await meRes.json()).data.id as number;

      // ── 1. 주문 생성(API arrange) ──
      const orderId = await arrangeOrder(admin, customer);

      // ── 2. 브라우저: 수거 대기 상태를 확인한다(청구서 미발행 → 배지 없음) ──
      // 진행 라벨은 상단 큰 텍스트 + StatusCard 내부 두 곳에 동일하게 렌더되므로 .first()로 특정한다.
      await signInCustomerUI(page, CUSTOMER_URL);
      await page.goto(`/status/${orderId}`);
      await expect(page.getByText('수거 대기').first()).toBeVisible();

      // ── 3. 백엔드: 선점→수거 완료 → 인보이스 발행(사가 홉) ──
      await pickupOrder(carrier, customer, orderId, customerId);

      // ── 4. 백엔드: 인보이스 발행이 자동과금을 트리거 → 결제 COMPLETED 대기(수동 /payments/pay 없음) ──
      const payment = await poll(
        '자동과금 완료(COMPLETED)',
        async () => {
          const res = await customer.get(`/api/v2/payments/${orderId}/payment`);
          if (!res.ok()) return null;
          const data = (await res.json()).data as { status: string };
          return data.status === 'COMPLETED' ? data : null;
        },
        60_000,
      );
      expect(payment.status).toBe('COMPLETED');

      // ── 5. 브라우저: 상세를 새로고침해 "결제 완료" 배지를 확인한다 ──
      // 배지는 StatusCard 안에 한 곳뿐이라 단일 매치. 진행 라벨은 위와 같은 이유로 .first().
      await page.reload();
      await expect(page.getByText('결제 완료')).toBeVisible();
      await expect(page.getByText('수거 완료').first()).toBeVisible();
    } finally {
      await admin.dispose();
      await customer.dispose();
      await carrier.dispose();
    }
  });
});
