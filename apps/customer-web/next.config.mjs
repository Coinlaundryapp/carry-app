import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */

const securityHeaders = [
  // DNS 프리페치 활성화 — 외부 리소스 로드 속도 향상
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  // 클릭재킹 방지 — 동일 출처에서만 iframe 허용
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // MIME 타입 스니핑 방지 — Content-Type 헤더 강제
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Referrer 정책 — HTTPS→HTTP 전환 시 전체 URL 미노출
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // 권한 정책 — 카메라/마이크 차단, 위치정보는 자체 출처만 허용
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
];

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // 소스맵 업로드 비활성화 — Sentry 계정 연결 후 활성화
  sourcemaps: {
    disable: true,
  },

  // 빌드 로그 억제
  silent: true,

  // 텔레메트리 비활성화
  telemetry: false,
});
