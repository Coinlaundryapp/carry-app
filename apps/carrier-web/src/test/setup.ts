import '@testing-library/jest-dom/vitest';
import { server } from './mocks/server';

// ── MSW 서버 라이프사이클 ───────────────────────────────────────────────────
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => {
  server.resetHandlers();
  window.localStorage.clear();
});
afterAll(() => server.close());

// ── next/navigation mock ────────────────────────────────────────────────────
const routerMock = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
};
vi.mock('next/navigation', () => ({
  useRouter: () => routerMock,
  useParams: () => ({}),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));
