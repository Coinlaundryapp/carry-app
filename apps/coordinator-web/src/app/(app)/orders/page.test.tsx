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

  it('기본은 전체 필터라 status 없이 조회하고 목록을 보여준다', async () => {
    // 예전 기본값 'PAID' 는 결제·물리 흐름 분리로 사라진 상태라 목록이 늘 비어 보였다.
    server.use(
      http.get('*/api/v2/coordinator/orders', ({ request }) => {
        expect(new URL(request.url).searchParams.get('status')).toBeNull();
        return ok([{ id: 1, customerId: 7, status: 'IN_PROGRESS' }]);
      }),
    );
    render(<OrdersPage />);
    expect(await screen.findByText('주문 #1')).toBeInTheDocument();
    expect(screen.getByText(/고객 #7/)).toBeInTheDocument();
    // '세탁중'은 필터 칩에도 있으므로 목록 항목(span)으로 좁혀 확인한다.
    expect(screen.getByText('세탁중', { selector: 'span' })).toBeInTheDocument();
  });

  it('상태 칩을 누르면 그 상태로 다시 조회한다', async () => {
    const seenStatuses: (string | null)[] = [];
    server.use(
      http.get('*/api/v2/coordinator/orders', ({ request }) => {
        seenStatuses.push(new URL(request.url).searchParams.get('status'));
        return ok([]);
      }),
    );
    render(<OrdersPage />);
    await screen.findByText('주문이 없습니다.');
    await userEvent.click(screen.getByRole('radio', { name: '수거됨' }));
    await waitFor(() => expect(seenStatuses).toContain('PICKED_UP'));
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
