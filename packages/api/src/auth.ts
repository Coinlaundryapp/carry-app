export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/** 토큰 저장소 추상화 — 앱이 구현(쿠키·localStorage·메모리 등). packages/api는 저장 방식을 모른다. */
export interface TokenStore {
  get(): TokenPair | null;
  set(tokens: TokenPair): void;
  clear(): void;
}

export interface RefreshCoordinatorConfig {
  tokenStore: TokenStore;
  /** refresh 토큰으로 새 토큰쌍을 회전 발급한다(`POST /api/v2/auth/refresh`). 실패 시 null. */
  refresh: (refreshToken: string) => Promise<TokenPair | null>;
  /** 회전 실패(세션 폐기 등) 시 호출 — 앱이 로그아웃 처리. */
  onLogout?: () => void;
}

/**
 * 401 → refresh 회전을 **single-flight**로 조율한다.
 *
 * 동시에 여러 요청이 401을 받아도 회전은 **한 번만** 일어난다. 백엔드(#82)는 refresh 토큰
 * 회전 시 이전 토큰을 무효화하고 재사용을 감지하면 세션을 폐기하므로, 동시 회전은 곧 자폭이다.
 * 진행 중인 회전이 있으면 그 Promise를 공유한다.
 */
export function createRefreshCoordinator(config: RefreshCoordinatorConfig) {
  let inFlight: Promise<TokenPair | null> | null = null;

  return {
    /** 진행 중 회전이 있으면 공유, 없으면 시작. 성공 시 새 토큰 저장, 실패 시 clear+onLogout. */
    refreshOnce(): Promise<TokenPair | null> {
      if (inFlight) return inFlight;

      inFlight = (async () => {
        const current = config.tokenStore.get();
        if (!current) return null;
        const rotated = await config.refresh(current.refreshToken).catch(() => null);
        if (rotated) {
          config.tokenStore.set(rotated);
          return rotated;
        }
        config.tokenStore.clear();
        config.onLogout?.();
        return null;
      })();

      // 다음 401 사이클에서 다시 회전할 수 있도록 완료 후 잠금 해제.
      void inFlight.finally(() => {
        inFlight = null;
      });
      return inFlight;
    },
  };
}

export type RefreshCoordinator = ReturnType<typeof createRefreshCoordinator>;
