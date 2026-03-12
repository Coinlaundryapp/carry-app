import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // DSN이 없으면 Sentry 비활성화 (로컬 개발 환경)
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 트레이싱 샘플링 비율 — 프로덕션에서는 0.1~0.2로 낮출 것
  tracesSampleRate: 1.0,

  environment: process.env.NODE_ENV,

  // 개발 환경에서는 디버그 로그 활성화
  debug: process.env.NODE_ENV === 'development',
});
