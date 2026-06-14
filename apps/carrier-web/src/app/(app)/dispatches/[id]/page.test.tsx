import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { useRouter } from 'next/navigation';
import { server } from '@/test/mocks/server';
import { tokenStore } from '@features/auth';
import DispatchDetailPage from './page';

const ok = <T,>(data: T) =>
  HttpResponse.json({ data, status: 200, code: 'SUCCESS', message: 'ok' });
const d = (over: Record<string, unknown> = {}) => ({
  id: 1,
  orderId: 10,
  laundromatId: 5,
  status: 'ASSIGNED',
  carrierId: 7,
  areaCode: 'GANGNAM',
  desiredPickupAt: '2026-06-14T10:00:00Z',
  createdAt: '2026-06-14T09:00:00Z',
  ...over,
});

describe('DispatchDetailPage', () => {
  beforeEach(() => tokenStore.set({ accessToken: 'a', refreshToken: 'r' }));
  afterEach(() => window.localStorage.clear());

  it('배정된 배차는 수락/거절 버튼을 보여준다', async () => {
    server.use(http.get('*/api/v2/dispatches/1', () => ok(d())));
    render(<DispatchDetailPage params={{ id: '1' }} />);
    expect(await screen.findByRole('button', { name: '수락' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '거절' })).toBeInTheDocument();
  });

  it('수락하면 ACCEPTED로 전이되고 안내를 표시한다', async () => {
    let status = 'ASSIGNED';
    server.use(
      http.get('*/api/v2/dispatches/1', () => ok(d({ status }))),
      http.post('*/api/v2/dispatches/1/accept', () => {
        status = 'ACCEPTED';
        return ok(d({ status: 'ACCEPTED' }));
      }),
    );
    render(<DispatchDetailPage params={{ id: '1' }} />);
    await userEvent.click(await screen.findByRole('button', { name: '수락' }));

    expect(await screen.findByRole('status')).toHaveTextContent('수락했습니다');
    // ACCEPTED가 되면 수락/거절 버튼이 사라진다(canRespond=false).
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: '수락' })).not.toBeInTheDocument(),
    );
  });

  it('거절하면 목록으로 돌아간다', async () => {
    server.use(
      http.get('*/api/v2/dispatches/1', () => ok(d())),
      http.post('*/api/v2/dispatches/1/reject', () =>
        ok(d({ status: 'PENDING', carrierId: null })),
      ),
    );
    render(<DispatchDetailPage params={{ id: '1' }} />);
    await userEvent.click(await screen.findByRole('button', { name: '거절' }));
    await waitFor(() => expect(useRouter().replace).toHaveBeenCalledWith('/dispatches'));
  });
});
