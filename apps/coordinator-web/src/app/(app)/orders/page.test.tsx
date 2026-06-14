import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { tokenStore } from '@features/auth';
import OrdersPage from './page';

const ok = <T,>(data: T) =>
  HttpResponse.json({ data, status: 200, code: 'SUCCESS', message: 'ok' });

describe('OrdersPage', () => {
  beforeEach(() => tokenStore.set({ accessToken: 'a', refreshToken: 'r' }));
  afterEach(() => window.localStorage.clear());

  it('기본 PAID 필터로 주문 목록을 보여준다', async () => {
    server.use(
      http.get('*/api/v2/coordinator/orders', ({ request }) => {
        expect(new URL(request.url).searchParams.get('status')).toBe('PAID');
        return ok([{ id: 1, customerId: 7, status: 'PAID', totalAmount: 15000 }]);
      }),
    );
    render(<OrdersPage />);
    expect(await screen.findByText('주문 #1')).toBeInTheDocument();
    expect(screen.getByText(/고객 #7/)).toBeInTheDocument();
  });

  it('필터를 전체로 바꾸면 status 없이 다시 조회한다', async () => {
    const seenStatuses: (string | null)[] = [];
    server.use(
      http.get('*/api/v2/coordinator/orders', ({ request }) => {
        seenStatuses.push(new URL(request.url).searchParams.get('status'));
        return ok([]);
      }),
    );
    render(<OrdersPage />);
    await screen.findByText('주문이 없습니다.');
    await userEvent.click(screen.getByRole('radio', { name: '전체' }));
    await waitFor(() => expect(seenStatuses).toContain(null));
  });

  it('조회 실패 시 에러를 표시한다', async () => {
    server.use(
      http.get('*/api/v2/coordinator/orders', () =>
        HttpResponse.json({ status: 500, code: 'ERROR', message: '오류' }, { status: 500 }),
      ),
    );
    render(<OrdersPage />);
    expect(await screen.findByRole('alert')).toHaveTextContent(/불러오지 못/);
  });
});
