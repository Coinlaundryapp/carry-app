import { test as base, request, type APIRequestContext } from '@playwright/test';

export type Role = 'CUSTOMER' | 'CARRIER' | 'COORDINATOR' | 'ADMIN';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8081';

/**
 * 백엔드 dev-login(#128)으로 역할별 토큰을 발급한다 — Kakao 없이 인증을 도달 가능하게 하는
 * E2E 하네스의 핵심. F1 이후 UI 시나리오에서 이 토큰을 주입해 인증 상태를 만든다.
 */
export async function devLogin(api: APIRequestContext, role: Role): Promise<TokenPair> {
  const res = await api.post(`${BACKEND_URL}/api/v2/auth/dev-login`, {
    data: { role },
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok()) {
    throw new Error(`dev-login(${role}) 실패: ${res.status()} ${await res.text()}`);
  }
  const body = (await res.json()) as { data: TokenPair };
  return body.data;
}

/** 역할별 dev-login 토큰을 주입한 fixture. `test('...', async ({ tokens }) => ...)`. */
export const test = base.extend<{ role: Role; tokens: TokenPair }>({
  role: ['CUSTOMER', { option: true }],
  tokens: async ({ role }, use) => {
    const api = await request.newContext();
    const tokens = await devLogin(api, role);
    await use(tokens);
    await api.dispose();
  },
});

export { expect } from '@playwright/test';
