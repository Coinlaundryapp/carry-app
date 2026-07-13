import { describe, it, expect, vi } from 'vitest';
import { type ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { useMyBillingKey } from './useMyBillingKey';

vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { accessToken: 'test-access-token' } } }),
}));

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('useMyBillingKey', () => {
  it('등록 카드를 조회한다', async () => {
    server.use(
      http.get('*/api/v2/billing-keys/me', () =>
        HttpResponse.json(
          {
            status: 200,
            code: 'OK',
            message: '',
            data: {
              cardCompany: '신한',
              cardLast4: '1234',
              registeredAt: '2026-07-13T00:00:00Z',
            },
          },
          { status: 200 },
        ),
      ),
    );
    const { result } = renderHook(() => useMyBillingKey(), { wrapper });
    await waitFor(() => expect(result.current.data).toMatchObject({ cardLast4: '1234' }));
  });
});
