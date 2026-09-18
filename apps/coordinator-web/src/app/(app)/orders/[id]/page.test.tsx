import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { tokenStore } from '@features/auth';
import OrderDetailPage from './page';

const ok = <T,>(data: T) =>
  HttpResponse.json({ data, status: 200, code: 'SUCCESS', message: 'ok' });
const order = (over: Record<string, unknown> = {}) => ({
  id: 7,
  customerId: 3,
  // 주문 상태는 물리 사실만 — 결제 상태(PAID 등)는 주문에 없다(Invoice/Payment 소관).
  status: 'PICKED_UP',
  laundromatId: 5,
  laundryItemType: 'REGULAR',
  selectedOptions: [],
  carrierId: null,
  cancelReason: null,
  ...over,
});

describe('OrderDetailPage', () => {
  beforeEach(() => tokenStore.set({ accessToken: 'a', refreshToken: 'r' }));
  afterEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('주문 상세를 보여주고 수거 이후 주문엔 환불 보상 취소 버튼을 노출한다', async () => {
    // 청구서는 수거 완료 시 발행되므로 PICKED_UP 부터 환불 보상 대상이 된다.
    server.use(http.get('*/api/v2/coordinator/orders/7', () => ok(order())));
    render(<OrderDetailPage params={{ id: '7' }} />);
    expect(await screen.findByText('수거됨')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /환불 보상/ })).toBeInTheDocument();
  });

  it('수거 전 주문은 환불 보상 문구 없이 일반 취소 버튼만 노출한다', async () => {
    server.use(
      http.get('*/api/v2/coordinator/orders/7', () => ok(order({ status: 'DISPATCHED' }))),
    );
    render(<OrderDetailPage params={{ id: '7' }} />);
    await screen.findByText('배차됨');
    expect(screen.getByRole('button', { name: '주문 취소' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /환불 보상/ })).not.toBeInTheDocument();
  });

  it('취소 시 사유를 담아 호출하고 환불 안내를 표시한다', async () => {
    let body: unknown;
    let status = 'PICKED_UP';
    server.use(
      http.get('*/api/v2/coordinator/orders/7', () => ok(order({ status }))),
      http.post('*/api/v2/coordinator/orders/7/cancel', async ({ request }) => {
        body = await request.json();
        status = 'CANCELLED';
        return new HttpResponse(null, { status: 204 });
      }),
    );
    vi.spyOn(window, 'prompt').mockReturnValue('운영 취소');

    render(<OrderDetailPage params={{ id: '7' }} />);
    await screen.findByText('수거됨');
    await userEvent.click(screen.getByRole('button', { name: /주문 취소/ }));

    await waitFor(() => expect(body).toEqual({ reason: '운영 취소' }));
    expect(await screen.findByText(/환불 보상이 진행/)).toBeInTheDocument();
  });

  it('완료된 주문엔 취소 버튼이 없다', async () => {
    server.use(http.get('*/api/v2/coordinator/orders/7', () => ok(order({ status: 'COMPLETED' }))));
    render(<OrderDetailPage params={{ id: '7' }} />);
    await screen.findByText('완료');
    expect(screen.queryByRole('button', { name: /취소/ })).not.toBeInTheDocument();
  });
});
