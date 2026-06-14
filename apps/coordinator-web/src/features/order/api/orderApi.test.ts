import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { tokenStore } from '@features/auth/lib/tokenStore';
import { cancelOrder, getOrder, getOrders } from './orderApi';

const ok = <T>(data: T) => ({ data, status: 200, code: 'SUCCESS', message: 'ok' });

describe('orderApi (coordinator)', () => {
  beforeEach(() => tokenStore.set({ accessToken: 'a', refreshToken: 'r' }));
  afterEach(() => window.localStorage.clear());

  it('getOrders는 상태 필터를 쿼리로 보낸다', async () => {
    let url: string | undefined;
    server.use(
      http.get('*/api/v2/coordinator/orders', ({ request }) => {
        url = request.url;
        return HttpResponse.json(ok([{ id: 1, status: 'PAID' }]));
      }),
    );
    const orders = await getOrders('PAID');
    expect(orders).toHaveLength(1);
    expect(url).toContain('status=PAID');
    expect(url).toContain('size=20');
  });

  it('getOrders는 상태 없이도 동작한다(전체)', async () => {
    let url: string | undefined;
    server.use(
      http.get('*/api/v2/coordinator/orders', ({ request }) => {
        url = request.url;
        return HttpResponse.json(ok([]));
      }),
    );
    await getOrders();
    expect(url).not.toContain('status=');
  });

  it('getOrder는 단건을 반환한다', async () => {
    server.use(
      http.get('*/api/v2/coordinator/orders/7', () =>
        HttpResponse.json(ok({ id: 7, status: 'PAID' })),
      ),
    );
    const order = await getOrder(7);
    expect(order.id).toBe(7);
  });

  it('cancelOrder는 reason을 본문에 담아 POST하고 204를 허용한다', async () => {
    let body: unknown;
    server.use(
      http.post('*/api/v2/coordinator/orders/7/cancel', async ({ request }) => {
        body = await request.json();
        return new HttpResponse(null, { status: 204 });
      }),
    );
    await expect(cancelOrder(7, '운영 취소')).resolves.toBeUndefined();
    expect(body).toEqual({ reason: '운영 취소' });
  });
});
