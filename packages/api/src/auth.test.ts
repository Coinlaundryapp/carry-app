import { describe, it, expect, vi } from 'vitest';
import { createRefreshCoordinator, type TokenPair, type TokenStore } from './auth';

function memoryStore(initial: TokenPair | null): TokenStore {
  let tokens = initial;
  return {
    get: () => tokens,
    set: (t) => {
      tokens = t;
    },
    clear: () => {
      tokens = null;
    },
  };
}

describe('createRefreshCoordinator', () => {
  it('회전 성공 시 새 토큰을 저장하고 반환한다', async () => {
    const store = memoryStore({ accessToken: 'a0', refreshToken: 'r0' });
    const refresh = vi.fn(async () => ({ accessToken: 'a1', refreshToken: 'r1' }));
    const coord = createRefreshCoordinator({ tokenStore: store, refresh });

    const result = await coord.refreshOnce();

    expect(result).toEqual({ accessToken: 'a1', refreshToken: 'r1' });
    expect(store.get()).toEqual({ accessToken: 'a1', refreshToken: 'r1' });
    expect(refresh).toHaveBeenCalledOnce();
    expect(refresh).toHaveBeenCalledWith('r0');
  });

  it('동시 401 N건이 회전을 공유한다 — refresh는 단 1회(single-flight, #82 자폭 방지)', async () => {
    const store = memoryStore({ accessToken: 'a0', refreshToken: 'r0' });
    let resolveRefresh: (t: TokenPair) => void = () => {};
    const refresh = vi.fn(
      () =>
        new Promise<TokenPair>((r) => {
          resolveRefresh = r;
        }),
    );
    const coord = createRefreshCoordinator({ tokenStore: store, refresh });

    const p1 = coord.refreshOnce();
    const p2 = coord.refreshOnce();
    const p3 = coord.refreshOnce();
    resolveRefresh({ accessToken: 'a1', refreshToken: 'r1' });
    const [r1, r2, r3] = await Promise.all([p1, p2, p3]);

    expect(refresh).toHaveBeenCalledOnce();
    expect(r1).toEqual(r2);
    expect(r2).toEqual(r3);
  });

  it('회전 실패 시 토큰을 비우고 onLogout을 1회 호출한다', async () => {
    const store = memoryStore({ accessToken: 'a0', refreshToken: 'r0' });
    const onLogout = vi.fn();
    const coord = createRefreshCoordinator({
      tokenStore: store,
      refresh: async () => null,
      onLogout,
    });

    const result = await coord.refreshOnce();

    expect(result).toBeNull();
    expect(store.get()).toBeNull();
    expect(onLogout).toHaveBeenCalledOnce();
  });

  it('완료 후 다음 사이클에서 다시 회전할 수 있다(잠금 해제)', async () => {
    const store = memoryStore({ accessToken: 'a0', refreshToken: 'r0' });
    const refresh = vi.fn(async (rt: string) => ({ accessToken: 'a+', refreshToken: rt + '+' }));
    const coord = createRefreshCoordinator({ tokenStore: store, refresh });

    await coord.refreshOnce();
    await coord.refreshOnce();

    expect(refresh).toHaveBeenCalledTimes(2);
  });
});
