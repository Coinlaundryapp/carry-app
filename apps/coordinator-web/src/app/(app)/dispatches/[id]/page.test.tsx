import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { tokenStore } from '@features/auth';
import DispatchDetailPage from './page';

const ok = <T,>(data: T) =>
  HttpResponse.json({ data, status: 200, code: 'SUCCESS', message: 'ok' });
const dispatch = (over: Record<string, unknown> = {}) => ({
  id: 5,
  orderId: 10,
  laundromatId: 3,
  status: 'PENDING',
  carrierId: null,
  areaCode: 'GANGNAM',
  cancelReason: null,
  ...over,
});

describe('DispatchDetailPage', () => {
  beforeEach(() => tokenStore.set({ accessToken: 'a', refreshToken: 'r' }));
  afterEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('PENDING 배차는 권역 배달원 목록을 불러와 배정할 수 있다', async () => {
    let assignBody: unknown;
    let status = 'PENDING';
    server.use(
      http.get('*/api/v2/coordinator/dispatches/5', () => ok(dispatch({ status }))),
      http.get('*/api/v2/coordinator/dispatches/carriers', () =>
        ok([{ id: 1, carrierId: 100, areaCode: 'GANGNAM', active: true }]),
      ),
      http.post('*/api/v2/coordinator/dispatches/5/assign', async ({ request }) => {
        assignBody = await request.json();
        status = 'ASSIGNED';
        return ok(dispatch({ status: 'ASSIGNED', carrierId: 100 }));
      }),
    );

    render(<DispatchDetailPage params={{ id: '5' }} />);
    await screen.findByText('권역 배달원 배정');
    await userEvent.click(screen.getByRole('button', { name: '배정' }));

    await waitFor(() => expect(assignBody).toEqual({ carrierId: 100 }));
    expect(await screen.findByText(/배달원 #100에게 배정/)).toBeInTheDocument();
  });

  it('배차 취소 시 사유를 담아 호출한다', async () => {
    let cancelBody: unknown;
    let status = 'PENDING';
    server.use(
      http.get('*/api/v2/coordinator/dispatches/5', () => ok(dispatch({ status }))),
      http.get('*/api/v2/coordinator/dispatches/carriers', () => ok([])),
      http.post('*/api/v2/coordinator/dispatches/5/cancel', async ({ request }) => {
        cancelBody = await request.json();
        status = 'CANCELLED';
        return new HttpResponse(null, { status: 204 });
      }),
    );
    vi.spyOn(window, 'prompt').mockReturnValue('운영 취소');

    render(<DispatchDetailPage params={{ id: '5' }} />);
    await userEvent.click(await screen.findByRole('button', { name: '배차 취소' }));

    await waitFor(() => expect(cancelBody).toEqual({ reason: '운영 취소' }));
  });
});
