import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import useOrderStore from '@features/order/model/order-store';
import OrderSubmitDrawer from './OrderSubmitDrawer';

const replace = vi.fn();
const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, push, back: vi.fn(), refresh: vi.fn(), prefetch: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { accessToken: 'test-access-token' } } }),
}));

// @assets/icons는 실제 .svg 자산을 import한다 — 워크스페이스 경로에 `[projects]`가 포함돼
// setup.ts의 `vi.mock('*.svg', ...)` glob이 매칭되지 않으므로(대괄호가 glob 문자 클래스로 해석됨)
// 이 화면이 쓰는 아이콘을 통째로 스텁 처리한다.
// 이 화면이 쓰는 아이콘만 명시 스텁 — Proxy 네임스페이스는 vite named-import interop에서
// 열거 키가 없어 undefined로 잡히고, `then` 트랩은 모듈을 thenable로 오인시켜 로더가 hang한다.
vi.mock('@assets/icons', () => ({
  LaundryBasketIcon: (props: Record<string, unknown>) => (
    <svg data-testid="icon-basket" {...props} />
  ),
  LaundryIcon: (props: Record<string, unknown>) => <svg data-testid="icon-laundry" {...props} />,
}));

// vaul Drawer(포털+애니메이션 ref)는 jsdom에서 마운트가 끝나지 않아 렌더가 hang한다.
// 인터셉 로직(handleConfirm/onError)만 검증하면 되므로 primitives를 인라인 렌더로 스텁한다.
vi.mock('@shared/ui/primitives/drawer', () => ({
  Drawer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DrawerContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DrawerTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DrawerClose: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// 등록 시트도 vaul Drawer 기반(F4)이라 동일 hang을 유발한다. open일 때 "카드 등록" 마커만
// 노출하는 단순 스텁으로 대체 — 시트 내부는 F4에서 검증됨. useMyBillingKey 등 나머지는 실제 유지.
vi.mock('@features/billing', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@features/billing')>()),
  BillingKeyRegistrationSheet: ({ open }: { open: boolean }) =>
    open ? <button type="button">카드 등록</button> : null,
}));

function renderDrawer() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  // 주의: 이 컴포넌트의 `canSubmit` prop은 실제로는 "제출 불가(blocked)" 플래그다
  // (Order.tsx 계산 — 이름과 반대 의미). 확인 버튼까지 도달하려면 false를 넘긴다.
  return render(
    <QueryClientProvider client={qc}>
      <OrderSubmitDrawer canSubmit={false} />
    </QueryClientProvider>,
  );
}

function seedSubmittableOrderStore() {
  useOrderStore.setState({
    orderContent: {
      orderUnitType: 'SOLO',
      orderRequestType: 'NEW',
      laundryItemType: 'REGULAR',
      laundrySpecs: [],
      washOption: 'STANDARD',
      dryOption: 'LOW_HEAT',
      additionalOptions: [],
    },
    addressId: 1,
    laundromat: {
      id: 1,
      address: '서울시 강남구 테헤란로 100',
      distance: 500,
      groupDeliveryFee: 0,
      latitude: 37.5065,
      longitude: 127.0536,
      mediaResources: [],
      name: '깨끗한 빨래방',
      options: ['WASHING_MACHINE'],
      reviewAverageRating: 0,
      reviewCount: 0,
    },
    orderSchedule: {
      desiredPickupDateTime: '2026-07-20T10:00:00',
      desiredDeliveryDateTime: '2026-07-21T18:00:00',
    },
  });
}

beforeEach(() => {
  replace.mockClear();
  push.mockClear();
  seedSubmittableOrderStore();
});

describe('OrderSubmitDrawer', () => {
  it('카드가 있으면 확인 클릭 시 바로 주문을 제출하고 상태 페이지로 이동한다', async () => {
    server.use(
      http.get('*/api/v2/billing-keys/me', () =>
        HttpResponse.json(
          {
            status: 200,
            code: 'OK',
            message: '',
            data: { cardCompany: '신한', cardLast4: '1234', registeredAt: '2026-07-01T00:00:00Z' },
          },
          { status: 200 },
        ),
      ),
      http.post('*/api/v2/orders', () =>
        HttpResponse.json(
          { status: 201, code: 'SUCCESS', message: 'created', data: { id: 42 } },
          { status: 201 },
        ),
      ),
    );
    const user = userEvent.setup();
    renderDrawer();

    // 카드 조회(useMyBillingKey)가 완료될 때까지 확인 버튼이 활성화되길 기다린다.
    const confirm = await screen.findByRole('button', { name: '확인' });
    await vi.waitFor(() => expect(confirm).toBeEnabled());
    await user.click(confirm);

    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith('/status/42'));
    expect(push).not.toHaveBeenCalled();
  });

  it('카드가 없으면 확인 클릭 시 등록 시트를 열고 주문을 제출하지 않는다', async () => {
    let orderPosted = false;
    server.use(
      http.get('*/api/v2/billing-keys/me', () =>
        HttpResponse.json(
          { status: 404, code: 'BILLING_KEY_NOT_FOUND', message: '' },
          { status: 404 },
        ),
      ),
      http.post('*/api/v2/orders', () => {
        orderPosted = true;
        return HttpResponse.json(
          { status: 201, code: 'SUCCESS', message: 'created', data: { id: 42 } },
          { status: 201 },
        );
      }),
    );
    const user = userEvent.setup();
    renderDrawer();

    const confirm = await screen.findByRole('button', { name: '확인' });
    await vi.waitFor(() => expect(confirm).toBeEnabled());
    await user.click(confirm);

    // 등록 시트(스텁)가 열린다.
    expect(await screen.findByRole('button', { name: '카드 등록' })).toBeInTheDocument();
    expect(orderPosted).toBe(false);
    expect(replace).not.toHaveBeenCalled();
  });

  it('연체 중이면 확인 클릭 시 연체 해소 페이지로 이동한다', async () => {
    server.use(
      http.get('*/api/v2/billing-keys/me', () =>
        HttpResponse.json(
          {
            status: 200,
            code: 'OK',
            message: '',
            data: { cardCompany: '신한', cardLast4: '1234', registeredAt: '2026-07-01T00:00:00Z' },
          },
          { status: 200 },
        ),
      ),
      http.post('*/api/v2/orders', () =>
        HttpResponse.json(
          { status: 409, code: 'OVERDUE_INVOICE_EXISTS', message: '연체 중입니다.' },
          { status: 409 },
        ),
      ),
    );
    const user = userEvent.setup();
    renderDrawer();

    const confirm = await screen.findByRole('button', { name: '확인' });
    await vi.waitFor(() => expect(confirm).toBeEnabled());
    await user.click(confirm);

    await vi.waitFor(() => expect(push).toHaveBeenCalledWith('/billing/overdue'));
    expect(replace).not.toHaveBeenCalled();
  });
});
