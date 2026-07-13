import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import MyCardSection from './MyCardSection';

vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { accessToken: 'test-access-token' } } }),
}));

// 등록 시트는 vaul Drawer 기반(F4)이라 jsdom에서 렌더가 hang한다(F6 교훈).
// MyCardSection이 직접 import하는 형제 모듈만 스텁하고 useMyBillingKey 등 나머지는 실제로 둔다.
vi.mock('./BillingKeyRegistrationSheet', () => ({
  default: ({ open }: { open: boolean }) =>
    open ? <button type="button">시트 열림</button> : null,
}));

function renderSection() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MyCardSection />
    </QueryClientProvider>,
  );
}

describe('MyCardSection', () => {
  it('등록된 카드가 있으면 카드 요약과 변경 버튼을 렌더한다', async () => {
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
    );
    renderSection();

    expect(await screen.findByText('신한 •••• 1234')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '변경' })).toBeInTheDocument();
  });

  it('등록된 카드가 없으면 안내와 카드 등록 버튼을 렌더한다', async () => {
    server.use(
      http.get('*/api/v2/billing-keys/me', () =>
        HttpResponse.json(
          { status: 404, code: 'BILLING_KEY_NOT_FOUND', message: '' },
          { status: 404 },
        ),
      ),
    );
    renderSection();

    expect(await screen.findByRole('button', { name: '카드 등록' })).toBeInTheDocument();
    expect(screen.getByText('등록된 카드가 없어요.')).toBeInTheDocument();
  });
});
