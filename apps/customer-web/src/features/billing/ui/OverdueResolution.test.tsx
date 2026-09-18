import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import OverdueResolution from './OverdueResolution';

vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { accessToken: 'test-access-token' } } }),
}));

// next/link는 App Router context 없이 렌더되면 prefetch(IntersectionObserver) 관련 동작이
// 얽힐 수 있어 단순 앵커로 스텁한다(StatusCard.test.tsx와 동일 패턴) — href만 검증하면 충분하다.
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: React.ComponentProps<'a'>) => (
    <a href={href as string} {...rest}>
      {children}
    </a>
  ),
}));

// 등록 시트는 vaul Drawer 기반(F4)이라 jsdom에서 렌더가 hang한다(F6 교훈).
// OverdueResolution이 직접 import하는 형제 모듈만 스텁하고, onSuccess를 트리거할 수 있게 한다.
vi.mock('./BillingKeyRegistrationSheet', () => ({
  default: ({ open, onSuccess }: { open: boolean; onSuccess: () => void }) =>
    open ? (
      <button type="button" onClick={onSuccess}>
        완료
      </button>
    ) : null,
}));

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <OverdueResolution />
    </QueryClientProvider>,
  );
}

describe('OverdueResolution', () => {
  it('초기 화면에 미납 안내와 카드 다시 등록 버튼을 렌더한다', () => {
    renderPage();

    expect(
      screen.getByText(
        '미납 결제가 있어 새 주문을 만들 수 없어요. 카드를 다시 등록하면 잠시 후 자동으로 재결제됩니다.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '카드 다시 등록' })).toBeInTheDocument();
  });

  it('카드 재등록 성공 후 확인 문구를 렌더한다', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: '카드 다시 등록' }));
    await user.click(await screen.findByRole('button', { name: '완료' }));

    expect(
      await screen.findByText('미납분 재결제가 처리되면 다시 주문할 수 있어요.'),
    ).toBeInTheDocument();
  });
});
