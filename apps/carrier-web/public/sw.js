// 설치형 PWA를 위한 최소 서비스 워커 — 오프라인 캐싱 없음(네트워크 패스스루).
// Android 설치 프롬프트(beforeinstallprompt)는 fetch 핸들러 존재를 요구하므로 빈 패스스루만 둔다.
// respondWith를 호출하지 않으므로 모든 요청은 브라우저 기본(네트워크)으로 처리된다 — stale 캐시·인증 충돌 없음.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {
  // network passthrough; intentionally no caching.
});
