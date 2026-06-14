import { tokenStore } from './tokenStore';

describe('tokenStore (localStorage 백업)', () => {
  afterEach(() => window.localStorage.clear());

  it('set한 토큰쌍을 get으로 되돌려준다', () => {
    tokenStore.set({ accessToken: 'a', refreshToken: 'r' });
    expect(tokenStore.get()).toEqual({ accessToken: 'a', refreshToken: 'r' });
  });

  it('비어 있으면 null을 반환한다', () => {
    expect(tokenStore.get()).toBeNull();
  });

  it('clear 후엔 null을 반환한다', () => {
    tokenStore.set({ accessToken: 'a', refreshToken: 'r' });
    tokenStore.clear();
    expect(tokenStore.get()).toBeNull();
  });

  it('손상된 JSON이면 null을 반환한다(throw 안 함)', () => {
    window.localStorage.setItem('carry-coordinator-tokens', '{not-json');
    expect(tokenStore.get()).toBeNull();
  });

  it('필드가 누락된 토큰이면 null을 반환한다', () => {
    window.localStorage.setItem('carry-coordinator-tokens', JSON.stringify({ accessToken: 'a' }));
    expect(tokenStore.get()).toBeNull();
  });
});
