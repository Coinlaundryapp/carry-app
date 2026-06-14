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
  status: 'PAID',
  laundromatId: 5,
  laundryItemType: 'REGULAR',
  selectedOptions: [],
  totalAmount: 15000,
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

  it('주문 상세를 보여주고 결제 완료 주문엔 환불 보상 취소 버튼을 노출한다', async () => {
    server.use(http.get('*/api/v2/coordinator/orders/7', () => ok(order())));
    render(<OrderDetailPage params={{ id: '7' }} />);
    expect(await screen.findByText('결제완료')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /환불 보상/ })).toBeInTheDocument();
  });

  it('취소 시 사유를 담아 호출하고 환불 안내를 표시한다', async () => {
    let body: unknown;
    let status = 'PAID';
    server.use(
      http.get('*/api/v2/coordinator/orders/7', () => ok(order({ status }))),
      http.post('*/api/v2/coordinator/orders/7/cancel', async ({ request }) => {
        body = await request.json();
        status = 'REFUND_PENDING';
        return new HttpResponse(null, { status: 204 });
      }),
    );
    vi.spyOn(window, 'prompt').mockReturnValue('운영 취소');

    render(<OrderDetailPage params={{ id: '7' }} />);
    await screen.findByText('결제완료');
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
