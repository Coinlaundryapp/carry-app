import { tokenStore } from './tokenStore';

/** 현재 인증 여부(토큰 보유) — 클라이언트 가드용. */
export function isAuthenticated(): boolean {
  return tokenStore.get() !== null;
}

/** 로그아웃 — 토큰 폐기. 리디렉트는 호출부(router)가 담당. */
export function logout(): void {
  tokenStore.clear();
}
