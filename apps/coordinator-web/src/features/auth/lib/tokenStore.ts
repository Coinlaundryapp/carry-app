import type { TokenPair, TokenStore } from '@carry/api';

/**
 * coordinator-web 토큰 저장소 — localStorage 백업.
 *
 * carrier-web과 동일 모델: NextAuth 없이(dev-login 전용 내부툴) 앱이 토큰을 직접 소유하고
 * `@carry/api`의 refresh coordinator가 회전을 조율한다([[shared/api/v2-client]]).
 * SSR 환경(window 부재)에선 조용히 no-op/null — authed 화면은 모두 클라이언트 컴포넌트다.
 */

const STORAGE_KEY = 'carry-coordinator-tokens';

function read(): TokenPair | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<TokenPair>;
    if (typeof parsed?.accessToken === 'string' && typeof parsed?.refreshToken === 'string') {
      return { accessToken: parsed.accessToken, refreshToken: parsed.refreshToken };
    }
    return null;
  } catch {
    return null;
  }
}

export const tokenStore: TokenStore = {
  get: read,
  set(tokens: TokenPair) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  },
  clear() {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(STORAGE_KEY);
  },
};
