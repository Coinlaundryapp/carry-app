/**
 * 리다이렉트 대상 URL을 **같은 오리진의 상대 경로**로만 제한한다(Open Redirect 방지).
 *
 * 허용: `/`로 시작 + `//`로 시작하지 않음(protocol-relative 차단) + 역슬래시(`\`) 없음
 *       (브라우저가 `\`를 `/`로 정규화 → `/\evil.com`이 `//evil.com`처럼 취급되는 우회 차단) +
 *       스킴 구분자(`:`) 없음(`javascript:`·`https:` 등 차단).
 * 그 외에는 안전한 기본값(fallback)으로 대체한다.
 */
export function sanitizeCallbackUrl(raw: unknown, fallback = '/login-done'): string {
  if (
    typeof raw === 'string' &&
    raw.startsWith('/') &&
    !raw.startsWith('//') &&
    !raw.includes('\\') &&
    !raw.includes(':')
  ) {
    return raw;
  }
  return fallback;
}
