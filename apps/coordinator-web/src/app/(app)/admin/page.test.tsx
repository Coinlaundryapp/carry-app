import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { useRouter } from 'next/navigation';
import { server } from '@/test/mocks/server';
import { tokenStore } from '@features/auth';
import AdminDashboardPage from './page';

const ok = <T,>(data: T) =>
  HttpResponse.json({ data, status: 200, code: 'SUCCESS', message: 'ok' });

const meAs = (role: string) =>
  http.get('*/api/v2/users/me', () =>
    ok({ id: 1, email: 'a@b.c', name: 'A', phone: '0', role, isActive: true }),
  );

const summaryOk = http.get('*/api/v2/admin/dashboard/summary', () =>
  ok({
    totalOrdersToday: 5,
    pendingDispatches: 2,
    activeDeliveries: 1,
    completedToday: 3,
    cancelledToday: 0,
  }),
);
const eventsOk = http.get('*/api/v2/admin/dashboard/events', () =>
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

describe('AdminDashboardPage (role 가드)', () => {
  beforeEach(() => tokenStore.set({ accessToken: 'a', refreshToken: 'r' }));
  afterEach(() => window.localStorage.clear());

  it('ADMIN은 운영 요약과 이벤트를 본다', async () => {
    server.use(meAs('ADMIN'), summaryOk, eventsOk);
    render(<AdminDashboardPage />);

    expect(await screen.findByText('오늘 주문')).toBeInTheDocument();
    expect(screen.getByText('OrderCreated')).toBeInTheDocument();
  });

  it('비-ADMIN(COORDINATOR)은 홈으로 리디렉트된다', async () => {
    server.use(meAs('COORDINATOR'), summaryOk, eventsOk);
    render(<AdminDashboardPage />);

    await waitFor(() => expect(useRouter().replace).toHaveBeenCalledWith('/'));
    expect(screen.queryByText('오늘 주문')).not.toBeInTheDocument();
  });
});
