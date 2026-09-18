import { ApiError, type ApiEnvelope } from './errors';
import { createRefreshCoordinator, type TokenPair, type TokenStore } from './auth';
import { IDEMPOTENCY_HEADER } from './idempotency';
import { decideRetry, defaultRetryPolicy, type RetryPolicy } from './retry';

/**
 * 백엔드 `ApiResponse` 봉투를 풀어 `data`를 반환하거나, 에러 봉투면 [ApiError]를 던진다.
 * 204(No Content) 등 본문 없는 응답은 `undefined`로 처리한다(예: 주문 취소).
 */
export async function unwrap<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const env: Partial<ApiEnvelope<T>> = text ? JSON.parse(text) : {};

  const status = env.status ?? res.status;
  if (res.ok && status < 400) {
    return env.data as T;
  }
  throw new ApiError(status, env.code ?? 'UNKNOWN', env.message ?? '', env.traceId);
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  /** 객체면 JSON 직렬화. 문자열/기타는 그대로. */
  body?: unknown;
  /** 멱등 명령(주문·결제·리뷰)에 붙일 Idempotency-Key. */
  idempotencyKey?: string;
}

export interface ApiClientConfig {
  baseUrl: string;
  /** 테스트에서 fake fetch 주입(기본: 전역 fetch). */
  fetchImpl?: typeof fetch;
  tokenStore?: TokenStore;
  refresh?: (refreshToken: string) => Promise<TokenPair | null>;
  onLogout?: () => void;
  retryPolicy?: RetryPolicy;
  /** 테스트에서 즉시 resolve 주입(기본: setTimeout). */
  sleep?: (ms: number) => Promise<void>;
}

const realSleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * v2 백엔드용 공유 API 클라이언트. 3개 앱이 함께 쓰며 plain `fetch` 기반(Sentry/Next 비결합).
 *
 * 한 요청의 흐름: Authorization·Idempotency-Key 부착 → fetch → 봉투 언래핑.
 * 에러 시: 401이면 refresh single-flight 후 1회 재시도, 그 외엔 [decideRetry] 정책(docs/14)대로 재시도.
 */
export function createApiClient(config: ApiClientConfig) {
  // 전역 fetch는 **요청 시점에** 해석한다 — 생성 시점에 캡처하면 이후 globalThis.fetch를 교체하는
  // 환경(msw 인터셉터·테스트 모킹)을 우회해버린다(F1 M-1 라이브 발견).
  const resolveFetch = () => config.fetchImpl ?? globalThis.fetch;
  const retryPolicy = config.retryPolicy ?? defaultRetryPolicy;
  const sleep = config.sleep ?? realSleep;
  const coordinator =
    config.tokenStore && config.refresh
      ? createRefreshCoordinator({
          tokenStore: config.tokenStore,
          refresh: config.refresh,
          onLogout: config.onLogout,
        })
      : null;

  async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { body, idempotencyKey, headers: initHeaders, ...rest } = options;
    let refreshed = false;
    let attempt = 1;

    for (;;) {
      const headers = new Headers(initHeaders);
      const tokens = config.tokenStore?.get();
      if (tokens) headers.set('Authorization', `Bearer ${tokens.accessToken}`);
      if (idempotencyKey) headers.set(IDEMPOTENCY_HEADER, idempotencyKey);

      let serializedBody: BodyInit | undefined;
      if (body !== undefined) {
        if (typeof body === 'string' || body instanceof FormData) {
          serializedBody = body as BodyInit;
        } else {
          headers.set('Content-Type', 'application/json');
          serializedBody = JSON.stringify(body);
        }
      }

      const res = await resolveFetch()(config.baseUrl + path, { ...rest, headers, body: serializedBody });
      try {
        return await unwrap<T>(res);
      } catch (error) {
        // 401 → refresh 회전(single-flight) 후 같은 시도 1회 재시도.
        if (error instanceof ApiError && error.status === 401 && coordinator && !refreshed) {
          const rotated = await coordinator.refreshOnce();
          if (rotated) {
            refreshed = true;
            continue;
          }
          throw error;
        }
        const decision = decideRetry(error, attempt, retryPolicy);
        if (decision.retry) {
          if (decision.delayMs > 0) await sleep(decision.delayMs);
          attempt += 1;
          continue;
        }
        throw error;
      }
    }
  }

  return { request };
}

export type ApiClient = ReturnType<typeof createApiClient>;
