// @carry/api — carry-platform v2 백엔드용 공유 API 클라이언트.
// plain fetch 기반(Sentry/Next 비결합) — 3개 앱이 공유하며 fetch 주입으로 테스트한다.

export { ApiError, type ApiEnvelope } from './errors';
export {
  createApiClient,
  unwrap,
  type ApiClient,
  type ApiClientConfig,
  type RequestOptions,
} from './client';
export {
  createRefreshCoordinator,
  type TokenPair,
  type TokenStore,
  type RefreshCoordinator,
  type RefreshCoordinatorConfig,
} from './auth';
export {
  decideRetry,
  defaultRetryPolicy,
  type RetryPolicy,
  type RetryDecision,
} from './retry';
export {
  newIdempotencyKey,
  newIdempotencyAttempt,
  IDEMPOTENCY_HEADER,
  type IdempotencyAttempt,
} from './idempotency';
