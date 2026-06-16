'use client';

import { useEffect } from 'react';

/**
 * 설치형 PWA용 서비스 워커 등록. 프로덕션에서만 /sw.js를 등록한다
 * (dev는 SW 캐시·HMR 충돌 회피). 캐싱은 하지 않으므로 등록 실패는 조용히 무시.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }, []);

  return null;
}
