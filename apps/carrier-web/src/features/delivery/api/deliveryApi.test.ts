import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { tokenStore } from '@features/auth';
import {
  completeDelivery,
  completeDrying,
  completePickup,
  getMyDeliveries,
  startWashing,
} from './deliveryApi';

const ok = <T>(data: T) => HttpResponse.json({ data, status: 200, code: 'SUCCESS', message: 'ok' });
const delivery = (over: Record<string, unknown> = {}) => ({
  id: 1,
  orderId: 10,
  dispatchId: 2,
  carrierId: 7,
  laundromatId: 5,
  status: 'PICKUP_PENDING',
  actualWeight: null,
  steps: [],
  createdAt: '2026-06-14T09:00:00Z',
  ...over,
});

describe('deliveryApi', () => {
  beforeEach(() => tokenStore.set({ accessToken: 'a', refreshToken: 'r' }));
  afterEach(() => window.localStorage.clear());

  it('getMyDeliveries는 내 배달 목록을 반환한다', async () => {
    server.use(http.get('*/api/v2/deliveries/my', () => ok([delivery(), delivery({ id: 2 })])));
    expect(await getMyDeliveries()).toHaveLength(2);
  });

  it('completePickup은 무게+사진을 보내고 누락 메타는 degrade 기본값으로 채운다', async () => {
    let body: Record<string, unknown> | undefined;
    server.use(
      http.post('*/api/v2/deliveries/1/pickup', async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>;
        return ok(delivery({ status: 'PICKED_UP', actualWeight: 3.5 }));
      }),
    );
    const result = await completePickup(1, { weight: 3.5, photoIds: [99] });

    expect(result.status).toBe('PICKED_UP');
    expect(body).toMatchObject({ weight: 3.5, photoIds: [99] });
    // @NotBlank 메타는 비-blank degrade 기본값이어야 400을 피한다.
    expect(body?.laundryItemType).toBe('UNKNOWN');
    expect(body?.orderUnitType).toBe('UNKNOWN');
    expect(body?.orderRequestType).toBe('UNKNOWN');
    expect(body?.customerId).toBe(0);
    expect(body?.selectedOptions).toEqual([]);
  });

  it('completePickup은 주입된 주문 메타가 있으면 그대로 보낸다(E2E 경로)', async () => {
    let body: Record<string, unknown> | undefined;
    server.use(
      http.post('*/api/v2/deliveries/1/pickup', async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>;
        return ok(delivery({ status: 'PICKED_UP' }));
      }),
    );
    await completePickup(1, {
      weight: 2,
      photoIds: [1],
      customerId: 55,
      laundryItemType: 'SHIRT',
      orderUnitType: 'KG',
      orderRequestType: 'WASH',
    });
    expect(body).toMatchObject({ customerId: 55, laundryItemType: 'SHIRT' });
  });

  it('washing/drying/delivery는 photoIds만 보내고 전이된 배달을 반환한다', async () => {
    let washingBody: Record<string, unknown> | undefined;
    server.use(
      http.post('*/api/v2/deliveries/1/washing', async ({ request }) => {
        washingBody = (await request.json()) as Record<string, unknown>;
        return ok(delivery({ status: 'IN_LAUNDRY' }));
      }),
      http.post('*/api/v2/deliveries/1/drying', () => ok(delivery({ status: 'LAUNDRY_COMPLETE' }))),
      http.post('*/api/v2/deliveries/1/delivery', () => ok(delivery({ status: 'DELIVERED' }))),
    );
    expect((await startWashing(1, [1])).status).toBe('IN_LAUNDRY');
    expect(washingBody).toEqual({ photoIds: [1] });
    expect((await completeDrying(1, [2])).status).toBe('LAUNDRY_COMPLETE');
    expect((await completeDelivery(1, [3])).status).toBe('DELIVERED');
  });
});
