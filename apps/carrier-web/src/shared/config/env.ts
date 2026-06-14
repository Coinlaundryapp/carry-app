import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

/**
 * carrier-web 환경변수. customer-web과 달리 카카오·Toss·Naver 키가 없다 —
 * dev-login 전용 내부 운영툴이라 백엔드 URL만 필요하다.
 */
export const env = createEnv({
  client: {
    NEXT_PUBLIC_BACKEND_URL: z.string().url(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
  },
  // 테스트(VITEST)·CI 빌드(SKIP_ENV_VALIDATION)에선 검증을 건너뛴다.
  skipValidation: process.env.VITEST === 'true' || !!process.env.SKIP_ENV_VALIDATION,
});
