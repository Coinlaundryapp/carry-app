import '@testing-library/jest-dom/vitest';
import { server } from './mocks/server';

// ── MSW 서버 라이프사이클 ───────────────────────────────────────────────────
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ── SVG mock ────────────────────────────────────────────────────────────────
// @svgr/webpack이 SVG를 React 컴포넌트로 변환하는데, Vitest에서는 이를 흉내낸다.
vi.mock('*.svg', () => ({
  default: (props: Record<string, unknown>) => {
    const { createElement } = require('react');
    return createElement('svg', { ...props, 'data-testid': 'svg-mock' });
  },
}));

// ── next/navigation mock ────────────────────────────────────────────────────
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useParams: () => ({}),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// ── next/image mock ─────────────────────────────────────────────────────────
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    const { createElement } = require('react');
    // eslint-disable-next-line @next/next/no-img-element
    return createElement('img', { ...props });
  },
}));

// ── window.matchMedia stub (for Tailwind / responsive hooks) ────────────────
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// ── IntersectionObserver stub ───────────────────────────────────────────────
const IntersectionObserverMock = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  takeRecords: vi.fn(),
  unobserve: vi.fn(),
}));
vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);

// ── ResizeObserver stub ─────────────────────────────────────────────────────
const ResizeObserverMock = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  unobserve: vi.fn(),
}));
vi.stubGlobal('ResizeObserver', ResizeObserverMock);
