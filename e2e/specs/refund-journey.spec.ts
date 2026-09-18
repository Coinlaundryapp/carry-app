import { test, expect, devLogin, type Role } from '../fixtures/auth';
import { request, type APIRequestContext } from '@playwright/test';

/**
 * F3 — **환불 보상 사가 관통(3-role: customer → carrier → coordinator)**을 라이브로 실증한다.
 *
 * F2 2-role 여정이 결제 벽(PG 어댑터 미구현)에 막혀 ORDER_NOT_PAID(402) 경계까지였다면,
 * F3는 **스텁 PG 어댑터(#134, local 프로파일)**로 그 벽을 허문다:
 *   customer 빌링키 등록 → 주문 → carrier 선점·수거(→ PickupCompletedEvent → 인보이스 발행) →
 *   자동과금(등록된 빌링키로 즉시 COMPLETED, 수동 `/payments/pay` 없음) → **coordinator 주문 취소** →
 *   환불 보상 사가(markRefundPending → RefundRetrySweeper PG 환불 → RefundCompletedEvent) →
 *   주문 REFUNDED.
 *
 * 빌링키 재설계(F1~F11) 이후 주문 생성 자체가 등록된 빌링키를 전제하므로, 주문 생성 전에
 * `POST /api/v2/billing-keys`로 빌링키를 먼저 arrange한다(billing-customer-ui.spec.ts와 동일 패턴).
 *
 * 3번째 액터(coordinator)가 환불을 구동한다. 환불 완료는 비동기(스위퍼 주기)라 polling으로
 * 대기한다 — 로컬 부팅 시 `CARRY_PAYMENT_REFUND_RETRY_INTERVAL_MS`를 낮춰 가속한다.
 * 코디 단건 조회는 A2(#135)의 `GET /coordinator/orders/{id}`(소유자 검증 없음)를 사용한다.
 *
 * **전제**: 백엔드 풀스택 기동(local 프로파일=스텁 PG, BACKEND_URL 기본 8081) + Kafka 3-node +
 * LocalStack S3 + service_areas/가격정책 시드. 세탁소는 ADMIN 직접 등록으로 PostGIS 우회.
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

/** 비동기 사가 전파를 기다린다 — fn이 non-null을 반환할 때까지 polling. */
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

test.describe('F3 환불 보상 여정 (3-role 라이브 사가)', () => {
  // 사가 다홉(주문→배차→배달→인보이스→결제→환불) + 스위퍼 주기라 타임아웃을 넉넉히.
  test.setTimeout(240_000);

  test('customer 주문·결제 → coordinator 취소 → 환불 보상 완료(REFUNDED)', async () => {
    const admin = await authedContext('ADMIN');
    const customer = await authedContext('CUSTOMER');
    const carrier = await authedContext('CARRIER');
    const coordinator = await authedContext('COORDINATOR');

    try {
      // ── 0. 세탁소 등록 (ADMIN) ──
      const laundromatRes = await admin.post('/api/v2/laundromats', {
        data: {
          name: 'E2E Refund Wash',
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

      // ── 1. CUSTOMER: 본인 + 빌링키 arrange(주문 생성이 등록된 빌링키를 전제) + 배송지 + 주문 ──
      const meRes = await customer.get('/api/v2/users/me');
      expect(meRes.ok()).toBeTruthy();
      const customerId = (await meRes.json()).data.id as number;

      await registerBillingKeyApi(customer, `e2e3r-billing-${Date.now()}`);

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
      const addressId = (await addrRes.json()).data.id as number;

      const orderRes = await customer.post('/api/v2/orders', {
        headers: { 'Idempotency-Key': `e2e3r-${addressId}-${laundromatId}-${Date.now()}` },
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

      // ── 2. CARRIER: 권역 등록 + 선점(→ 배달 생성) ──
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
      const deliveryId = delivery.id;

      // ── 3. CARRIER: 수거 완료 → PickupCompletedEvent → 인보이스 발행(사가) ──
      const pickupRes = await carrier.post(`/api/v2/deliveries/${deliveryId}/pickup`, {
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

      // ── 4. 사가 홉: 인보이스 발행 대기(customer가 본인 인보이스 조회) ──
      const invoice = await poll('발행된 인보이스', async () => {
        const res = await customer.get(`/api/v2/payments/${orderId}/invoice`);
        if (!res.ok()) return null;
        return (await res.json()).data as { id: number; totalAmount: number; status: string };
      });
      expect(invoice.totalAmount).toBeGreaterThan(0);

      // ── 5. 사가 홉: 인보이스 발행이 자동과금을 트리거 → 결제 COMPLETED 대기(수동 /payments/pay 없음) ──
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

      // ── 6. 사가 홉: 결제 완료 → 주문 PAID 대기 ──
      await poll('주문 PAID', async () => {
        const res = await customer.get(`/api/v2/orders/${orderId}`);
        if (!res.ok()) return null;
        return (await res.json()).data.status === 'PAID' ? true : null;
      });

      // ── 7. COORDINATOR: 주문 취소 → 환불 보상 시작(PAID → REFUND_PENDING) ──
      const cancelRes = await coordinator.post(`/api/v2/coordinator/orders/${orderId}/cancel`, {
        data: { reason: 'E2E 환불 보상 검증' },
      });
      expect(cancelRes.status(), await cancelRes.text()).toBe(204);

      // ── 8. 환불 보상 사가 완료 대기 → REFUNDED ──
      // markRefundPending → RefundRetrySweeper가 스텁 PG 환불 성공 → RefundCompletedEvent →
      // 주문 사가 markRefunded. 코디 단건 조회(A2)로 소유자 검증 없이 상태를 본다.
      const finalStatus = await poll(
        '환불 완료(REFUNDED)',
        async () => {
          const res = await coordinator.get(`/api/v2/coordinator/orders/${orderId}`);
          if (!res.ok()) return null;
          const status = (await res.json()).data.status as string;
          return status === 'REFUNDED' ? status : null;
        },
        120_000,
      );
      expect(finalStatus).toBe('REFUNDED');

      // ── 9. 결제도 환불 완료 상태인지 확인 ──
      const paymentRes = await customer.get(`/api/v2/payments/${orderId}/payment`);
      expect(paymentRes.ok()).toBeTruthy();
      expect((await paymentRes.json()).data.status).toBe('REFUNDED');
    } finally {
      await admin.dispose();
      await customer.dispose();
      await carrier.dispose();
      await coordinator.dispose();
    }
  });
});
