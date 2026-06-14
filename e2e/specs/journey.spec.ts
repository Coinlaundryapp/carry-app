import { test, expect, devLogin } from '../fixtures/auth';
import { request, type APIRequestContext } from '@playwright/test';

/**
 * F1 M-9 — customer-web v2 마이그레이션 **핵심 여정**을 라이브 백엔드로 실증한다.
 *
 * customer-web의 feature API가 호출하는 바로 그 v2 엔드포인트들을, dev-login 토큰으로
 * 실제 carry-platform 백엔드에 대고 관통 검증한다(인증→배송지→주문→상태). 단위 테스트는
 * msw 목으로 계약을 고정하고, 이 여정은 그 계약이 **실 백엔드와 일치**함을 증명한다.
 *
 * **우회(외부/인프라 의존)**: 주소검색(Naver geocode 키)·세탁소 검색(로컬 PostGIS 부재)·
 * 결제 승인(Toss PG)은 라이브 불가라 건너뛴다. 배송지 좌표는 직접 주입(geocode 우회),
 * 세탁소는 ADMIN으로 등록(findNearby PostGIS 우회), 결제는 청구서 단계까지 두지 않는다.
 *
 * **전제**: 백엔드 풀스택이 BACKEND_URL(기본 8081)에 기동. 미기동이면 dev-login에서 실패한다.
 */

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8081';

/** 역할 토큰으로 Authorization 헤더가 고정된 API 컨텍스트를 만든다. */
async function authedContext(role: 'CUSTOMER' | 'ADMIN'): Promise<APIRequestContext> {
  const base = await request.newContext();
  const { accessToken } = await devLogin(base, role);
  await base.dispose();
  return request.newContext({
    baseURL: BACKEND_URL,
    extraHTTPHeaders: { Authorization: `Bearer ${accessToken}` },
  });
}

test.describe('F1 핵심 여정 (라이브 v2)', () => {
  test('인증 → 배송지 → 주문 → 상태 관통', async () => {
    const admin = await authedContext('ADMIN');
    const customer = await authedContext('CUSTOMER');

    try {
      // ── 0. 세탁소 시드 (ADMIN) — findNearby(PostGIS) 우회용 직접 등록 ──
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

      // ── 1. 인증 확인 (CUSTOMER) — users/me ──
      const meRes = await customer.get('/api/v2/users/me');
      expect(meRes.ok()).toBeTruthy();
      expect((await meRes.json()).data.role).toBe('CUSTOMER');

      // ── 2. 배송지 생성 (M-2) — geocode 우회: 좌표·areaCode 직접 주입 ──
      const createAddr = await customer.post('/api/v2/shipping-addresses', {
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
      expect(createAddr.status(), await createAddr.text()).toBe(201);
      const address = (await createAddr.json()).data;
      const addressId = address.id as number;
      expect(address.areaCode).toBe('GANGNAM');
      expect(address.zipCode).toBe('06234');

      // ── 3. 배송지 목록·기본설정 (M-2) ──
      const listAddr = await customer.get('/api/v2/shipping-addresses');
      expect(listAddr.ok()).toBeTruthy();
      const addresses = (await listAddr.json()).data as Array<{ id: number }>;
      expect(addresses.some((a) => a.id === addressId)).toBeTruthy();

      const setDefault = await customer.put(`/api/v2/shipping-addresses/${addressId}/default`);
      expect(setDefault.ok()).toBeTruthy();

      // ── 4. 주문 생성 (M-6) — selectedOptions 평탄화 + Idempotency-Key ──
      const createOrder = await customer.post('/api/v2/orders', {
        headers: { 'Idempotency-Key': `e2e-${addressId}-${laundromatId}` },
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
      expect(createOrder.status(), await createOrder.text()).toBe(201);
      const order = (await createOrder.json()).data;
      const orderId = order.id as number;
      expect(order.laundromatId).toBe(laundromatId);
      // 배송지가 주문에 임베드(상세 화면이 읽는 형태)
      expect(order.roadAddress).toBe('Seoul Gangnam Teheran-ro 123');
      // selectedOptions 라운드트립
      expect(order.selectedOptions).toEqual(
        expect.arrayContaining([
          { optionType: 'WASH', subOptionType: 'STANDARD' },
          { optionType: 'DRY', subOptionType: 'LOW_HEAT' },
        ]),
      );

      // ── 5. 주문 목록·상세 (M-8) ──
      const myOrders = await customer.get('/api/v2/orders/my?size=10');
      expect(myOrders.ok()).toBeTruthy();
      const orders = (await myOrders.json()).data as Array<{ id: number }>;
      expect(orders.some((o) => o.id === orderId)).toBeTruthy();

      const detail = await customer.get(`/api/v2/orders/${orderId}`);
      expect(detail.ok()).toBeTruthy();
      expect((await detail.json()).data.id).toBe(orderId);

      // ── 6. 배송지 삭제 (M-2) ──
      // 기본 배송지는 다른 배송지가 있으면 삭제가 거부되므로(백엔드 규칙), 삭제 검증은
      // 비기본 임시 배송지로 한다(사전 데이터 유무와 무관하게 견고).
      const throwaway = await customer.post('/api/v2/shipping-addresses', {
        data: {
          alias: 'temp',
          roadAddress: 'Seoul Gangnam Teheran-ro 999',
          detailAddress: 'tmp',
          zipCode: '06234',
          latitude: 37.5065,
          longitude: 127.0536,
          recipientName: 'Tmp',
          recipientPhone: '010-0000-0000',
          areaCode: 'GANGNAM',
        },
      });
      expect(throwaway.status()).toBe(201);
      const throwawayId = (await throwaway.json()).data.id as number;
      const del = await customer.delete(`/api/v2/shipping-addresses/${throwawayId}`);
      expect(del.status()).toBe(204);
    } finally {
      await admin.dispose();
      await customer.dispose();
    }
  });
});
