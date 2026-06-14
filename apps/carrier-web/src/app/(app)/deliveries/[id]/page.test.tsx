import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { tokenStore } from '@features/auth';
import DeliveryDetailPage from './page';

const ok = <T,>(data: T) =>
  HttpResponse.json({ data, status: 200, code: 'SUCCESS', message: 'ok' });
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
const mediaOk = http.post('*/api/v2/media/upload/:folder', () =>
  HttpResponse.json({
    data: { id: 99, accessKey: 'k' },
    status: 201,
    code: 'CREATED',
    message: 'ok',
  }),
);

describe('DeliveryDetailPage (상태기계)', () => {
  beforeEach(() => tokenStore.set({ accessToken: 'a', refreshToken: 'r' }));
  afterEach(() => window.localStorage.clear());

  it('수거 대기 상태에선 무게 입력과 사진 업로드를 받아 수거 완료를 호출한다', async () => {
    let status = 'PICKUP_PENDING';
    let pickupBody: Record<string, unknown> | undefined;
    server.use(
      mediaOk,
      http.get('*/api/v2/deliveries/1', () =>
        ok(delivery({ status, actualWeight: status === 'PICKED_UP' ? 3.5 : null })),
      ),
      http.post('*/api/v2/deliveries/1/pickup', async ({ request }) => {
        pickupBody = (await request.json()) as Record<string, unknown>;
        status = 'PICKED_UP';
        return ok(delivery({ status: 'PICKED_UP', actualWeight: 3.5 }));
      }),
    );
    render(<DeliveryDetailPage params={{ id: '1' }} />);

    // 수거 액션 노출.
    const submit = await screen.findByRole('button', { name: '수거 완료' });
    expect(submit).toBeDisabled(); // 무게·사진 없으면 비활성.

    await userEvent.type(screen.getByLabelText('세탁물 무게(kg)'), '3.5');
    await userEvent.upload(
      screen.getByLabelText('사진 추가'),
      new File(['x'], 'p.jpg', { type: 'image/jpeg' }),
    );
    await waitFor(() => expect(screen.getByText('사진 1장 첨부됨')).toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: '수거 완료' }));

    await waitFor(() => expect(pickupBody).toMatchObject({ weight: 3.5, photoIds: [99] }));
    // 전이 후 다음 단계(세탁 시작)로 폼이 바뀐다.
    expect(await screen.findByRole('button', { name: '세탁 시작' })).toBeInTheDocument();
  });

  it('세탁 중 상태에선 사진만으로 건조 완료를 호출한다', async () => {
    server.use(
      mediaOk,
      http.get('*/api/v2/deliveries/1', () =>
        ok(delivery({ status: 'IN_LAUNDRY', actualWeight: 3.5 })),
      ),
      http.post('*/api/v2/deliveries/1/drying', () => ok(delivery({ status: 'LAUNDRY_COMPLETE' }))),
    );
    render(<DeliveryDetailPage params={{ id: '1' }} />);

    expect(await screen.findByRole('button', { name: '건조 완료' })).toBeInTheDocument();
    // 무게 입력은 없다(pickup만 필요).
    expect(screen.queryByLabelText('세탁물 무게(kg)')).not.toBeInTheDocument();

    await userEvent.upload(
      screen.getByLabelText('사진 추가'),
      new File(['x'], 'p.jpg', { type: 'image/jpeg' }),
    );
    await userEvent.click(await screen.findByRole('button', { name: '건조 완료' }));
    // 호출 성공 시 reload(여기선 동일 핸들러라 폼 유지) — 에러 안내가 없어야 한다.
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
  });

  it('배달 완료(DELIVERED) 상태면 액션 폼 없이 완료 메시지를 보여준다', async () => {
    server.use(
      http.get('*/api/v2/deliveries/1', () =>
        ok(delivery({ status: 'DELIVERED', actualWeight: 3.5 })),
      ),
    );
    render(<DeliveryDetailPage params={{ id: '1' }} />);
    expect(await screen.findByText('배달이 완료되었습니다.')).toBeInTheDocument();
    expect(screen.queryByLabelText('사진 추가')).not.toBeInTheDocument();
  });
});
