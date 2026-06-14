import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { tokenStore } from '@features/auth/lib/tokenStore';
import { getRecentEvents, getSummary } from './operationApi';

const ok = <T>(data: T) => ({ data, status: 200, code: 'SUCCESS', message: 'ok' });

describe('operationApi (admin dashboard)', () => {
  beforeEach(() => tokenStore.set({ accessToken: 'a', refreshToken: 'r' }));
  afterEach(() => window.localStorage.clear());

  it('getSummary는 운영 요약을 반환한다', async () => {
    server.use(
      http.get('*/api/v2/admin/dashboard/summary', () =>
        HttpResponse.json(
          ok({
            totalOrdersToday: 5,
            pendingDispatches: 2,
            activeDeliveries: 1,
            completedToday: 3,
            cancelledToday: 0,
          }),
        ),
      ),
    );
    const s = await getSummary();
    expect(s.totalOrdersToday).toBe(5);
    expect(s.pendingDispatches).toBe(2);
  });

  it('getRecentEvents는 limit을 쿼리로 보낸다', async () => {
    let url: string | undefined;
    server.use(
      http.get('*/api/v2/admin/dashboard/events', ({ request }) => {
        url = request.url;
        return HttpResponse.json(
          ok([
            {
              id: 1,
              eventType: 'OrderCreated',
              aggregateType: 'Order',
              aggregateId: 10,
              summary: '주문 생성',
            },
          ]),
        );
      }),
    );
    const events = await getRecentEvents(20);
    expect(events).toHaveLength(1);
    expect(url).toContain('limit=20');
  });
});
