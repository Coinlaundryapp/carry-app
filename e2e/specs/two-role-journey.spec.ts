import { test, expect, devLogin, type Role } from '../fixtures/auth';
import { request, type APIRequestContext } from '@playwright/test';

/**
 * F2 — **2-role(customer → carrier) 사가 관통**을 라이브 백엔드로 실증한다.
 *
 * customer가 주문하면 OrderCreatedEvent → carry-dispatch가 PENDING 배차 생성. carrier가
 * 권역을 등록하고 그 배차를 선점하면(self-claim은 PENDING→ACCEPTED 직행) DispatchAcceptedEvent
 * → carry-delivery가 Delivery를 생성(PICKUP_PENDING). carrier가 상태기계(수거→세탁→건조)를
 * 관통해 LAUNDRY_COMPLETE에 도달한다. 두 비동기 핸드오프(주문→배차, 선점→배달)는 Kafka 경유라
 * polling으로 대기한다. 최종 배달(→DELIVERED)은 주문 PAID를 요구하는데 결제 사가(PG 어댑터)가
 * 보류 상태라, 그 경계를 ORDER_NOT_PAID(402)로 명시 단언한다.
 *
 * carrier-web의 feature API가 치는 바로 그 v2 엔드포인트들을 dev-login 토큰으로 호출한다 —
 * 단위 테스트(msw)가 고정한 계약이 실 백엔드·사가와 일치함을 증명한다.
 *
 * **전제**: 백엔드 풀스택 기동(BACKEND_URL, 기본 8081) + Kafka 3-node + LocalStack S3(미디어
 * 업로드). 세탁소는 ADMIN 직접 등록으로 findNearby(PostGIS) 우회.
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
  timeoutMs = 45_000,
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

/** 더미 사진을 업로드하고 media id를 반환한다(LocalStack S3). */
async function uploadPhoto(carrier: APIRequestContext, name: string): Promise<number> {
  const res = await carrier.post('/api/v2/media/upload/delivery', {
    multipart: {
      file: { name, mimeType: 'image/jpeg', buffer: Buffer.from(`fake-${name}`) },
    },
  });
  expect(res.status(), await res.text()).toBe(201);
  return (await res.json()).data.id as number;
}

test.describe('F2 2-role 여정 (라이브 사가)', () => {
  // 사가 2홉(각 polling) + 미디어 업로드 + 4단계 전이라 기본 타임아웃을 늘린다.
  test.setTimeout(180_000);

  test('customer 주문 → carrier 선점·세탁 완료 (배달 완료는 결제 의존)', async () => {
    const admin = await authedContext('ADMIN');
    const customer = await authedContext('CUSTOMER');
    const carrier = await authedContext('CARRIER');

    try {
      // ── 0. 세탁소 등록 (ADMIN) — PostGIS 우회 직접 insert ──
      const laundromatRes = await admin.post('/api/v2/laundromats', {
        data: {
          name: 'E2E Wash',
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

      // ── 1. CUSTOMER: 본인 식별 + 배송지 + 주문 ──
      const meRes = await customer.get('/api/v2/users/me');
      expect(meRes.ok()).toBeTruthy();
      const customerId = (await meRes.json()).data.id as number;

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
        headers: { 'Idempotency-Key': `e2e2r-${addressId}-${laundromatId}-${Date.now()}` },
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

      // ── 2. CARRIER: 활동 권역 등록 (available 배차는 carrier 권역으로 필터된다) ──
      const areaRes = await carrier.post('/api/v2/carrier-areas', {
        data: { areaCode: 'GANGNAM', areaName: '강남구' },
      });
      // 이미 등록돼 있으면 409 — 둘 다 진행 가능.
      expect([201, 409], await areaRes.text()).toContain(areaRes.status());

      // ── 3. 사가 1홉: 주문 → PENDING 배차 (Kafka). 우리 주문의 배차가 노출될 때까지 대기 ──
      const dispatchId = await poll('available 배차', async () => {
        const res = await carrier.get('/api/v2/dispatches/available?size=50');
        if (!res.ok()) return null;
        const list = (await res.json()).data as Array<{ id: number; orderId: number }>;
        return list.find((d) => d.orderId === orderId)?.id ?? null;
      });

      // ── 4. CARRIER: 선점 ──
      // 캐리어 self-claim은 PENDING → ACCEPTED로 **직접** 전이하며 곧바로 DispatchAcceptedEvent를
      // 발행한다(별도 accept 엔드포인트는 coordinator-ASSIGNED 경로 전용). 따라서 claim 한 번으로
      // 배달 사가가 트리거된다.
      const claimRes = await carrier.post(`/api/v2/dispatches/${dispatchId}/claim`);
      expect(claimRes.status(), await claimRes.text()).toBe(200);
      expect((await claimRes.json()).data.status).toBe('ACCEPTED');

      // ── 5. 사가 2홉: 선점(=수락) → Delivery 생성 (Kafka). 내 배달에 나타날 때까지 대기 ──
      const delivery = await poll('생성된 배달', async () => {
        const res = await carrier.get('/api/v2/deliveries/my?size=50');
        if (!res.ok()) return null;
        const list = (await res.json()).data as Array<{ id: number; orderId: number; status: string }>;
        return list.find((d) => d.orderId === orderId) ?? null;
      });
      expect(delivery.status).toBe('PICKUP_PENDING');
      const deliveryId = delivery.id;

      // ── 6. 배달 상태기계 관통 (각 단계 사진 증빙 + 수거는 무게) ──
      const pickupRes = await carrier.post(`/api/v2/deliveries/${deliveryId}/pickup`, {
        data: {
          weight: 3.5,
          photoIds: [await uploadPhoto(carrier, 'pickup.jpg')],
          // 주문 메타: carrier UI엔 표면이 없어 degrade(known-debt). 여기선 known 값 일부 주입.
          customerId,
          laundryItemType: 'REGULAR',
          orderUnitType: 'UNKNOWN',
          orderRequestType: 'UNKNOWN',
          selectedOptions: [],
        },
      });
      expect(pickupRes.status(), await pickupRes.text()).toBe(200);
      expect((await pickupRes.json()).data.status).toBe('PICKED_UP');

      const washingRes = await carrier.post(`/api/v2/deliveries/${deliveryId}/washing`, {
        data: { photoIds: [await uploadPhoto(carrier, 'washing.jpg')] },
      });
      expect(washingRes.status(), await washingRes.text()).toBe(200);
      expect((await washingRes.json()).data.status).toBe('IN_LAUNDRY');

      const dryingRes = await carrier.post(`/api/v2/deliveries/${deliveryId}/drying`, {
        data: { photoIds: [await uploadPhoto(carrier, 'drying.jpg')] },
      });
      expect(dryingRes.status(), await dryingRes.text()).toBe(200);
      expect((await dryingRes.json()).data.status).toBe('LAUNDRY_COMPLETE');

      // ── 7. 최종 배달(→DELIVERED)은 주문 PAID를 요구한다 ──
      // 결제 사가는 보류 상태다(PgProvider TOSS_PAYMENTS 어댑터 미구현 → 주문이 PAID에 도달
      // 불가, F1서 Toss PG로 보류한 그 결제). 따라서 이 결제 경계를 ORDER_NOT_PAID(402)로
      // **명시 단언**한다 — 2-role(customer↔carrier) 사가 핸드오프와 배달 상태기계(수거→세탁→
      // 건조)는 여기까지 완전히 관통됨이 증명된다. PG 어댑터 배선 시 DELIVERED까지 확장한다.
      const deliveryRes = await carrier.post(`/api/v2/deliveries/${deliveryId}/delivery`, {
        data: { photoIds: [await uploadPhoto(carrier, 'delivery.jpg')] },
      });
      expect(deliveryRes.status(), await deliveryRes.text()).toBe(402);
      expect((await deliveryRes.json()).code).toBe('ORDER_NOT_PAID');

      // ── 8. 최종 단언: 배달은 LAUNDRY_COMPLETE에 머물고 수거 무게가 기록돼 있다 ──
      const finalRes = await carrier.get(`/api/v2/deliveries/${deliveryId}`);
      expect(finalRes.ok()).toBeTruthy();
      const final = (await finalRes.json()).data;
      expect(final.status).toBe('LAUNDRY_COMPLETE');
      expect(Number(final.actualWeight)).toBe(3.5);
    } finally {
      await admin.dispose();
      await customer.dispose();
      await carrier.dispose();
    }
  });
});
