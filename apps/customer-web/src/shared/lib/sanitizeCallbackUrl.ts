/**
 * 리다이렉트 대상 URL을 **같은 오리진의 상대 경로**로만 제한한다(Open Redirect 방지).
 *
 * 1차 문자열 게이트: `/`로 시작 + `//`로 시작하지 않음(protocol-relative 차단) + 역슬래시(`\`) 없음
 *   (브라우저가 `\`를 `/`로 정규화 → `/\evil.com`이 `//evil.com`처럼 취급되는 우회 차단).
 * 2차 오리진 검증: WHATWG URL 파서로 base 오리진에 resolve해 origin이 base와 다르면 거부한다.
 *   WHATWG 파서는 `\t\n\r`를 제거하므로 `/\t/evil.com` 같은 컨트롤 문자 우회가 `//evil.com`으로
 *   재구성돼 cross-origin으로 판정 → 차단된다. 스킴은 오리진 검증이 흡수하므로 별도 `:` 검사 불필요
 *   (→ `/search?q=12:30` 같은 정상 경로를 과도 차단하지 않는다).
 * 그 외/파싱 실패 시 안전한 기본값(fallback)으로 대체한다.
 */
export function sanitizeCallbackUrl(raw: unknown, fallback = '/login-done'): string {
  if (
    typeof raw !== 'string' ||
    !raw.startsWith('/') ||
    raw.startsWith('//') ||
    raw.includes('\\')
  ) {
    return fallback;
  }
  try {
    const base = 'http://localhost';
    const url = new URL(raw, base);
    // 컨트롤 문자·protocol-relative 트릭은 off-origin으로 resolve → 거부.
    if (url.origin !== base) return fallback;
    // 정규화된 같은 오리진 경로만 반환.
    return url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
}
