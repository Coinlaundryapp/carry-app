import { describe, it, expect, vi, beforeEach } from 'vitest';
import { type ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { useMyBillingKey } from './useMyBillingKey';

// 테스트별로 세션 상태를 바꿀 수 있도록 mutable 변수로 둔다.
let mockSession: { data: unknown; status: string } = {
  data: { user: { accessToken: 'test-access-token' } },
  status: 'authenticated',
};
vi.mock('next-auth/react', () => ({
  useSession: () => mockSession,
}));

beforeEach(() => {
  mockSession = {
    data: { user: { accessToken: 'test-access-token' } },
    status: 'authenticated',
  };
});

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

  it('세션 로딩 중에는 fetch가 없어도 isLoading이 true다', () => {
    // 세션 미해석(status==='loading') — accessToken이 없어 query는 disabled라 fetch가 없다.
    // 이때 query.isLoading은 false지만, 훅이 세션 로딩을 합산해 isLoading을 true로 보고해야
    // 소비자가 '카드 없음'으로 조기 판정하지 않는다.
    mockSession = { data: undefined, status: 'loading' };
    const { result } = renderHook(() => useMyBillingKey(), { wrapper });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });
});
