import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  /**
   * 서버 사이드 전용 환경변수.
   * 클라이언트 번들에 포함되지 않으며, 서버에서만 접근 가능.
   */
  server: {
    AUTH_SECRET: z.string().min(1),
  },

  /**
   * 클라이언트 사이드 환경변수 (NEXT_PUBLIC_ 접두사).
   * Next.js가 빌드 시 인라인하므로 클라이언트에서도 접근 가능.
   */
  client: {
    NEXT_PUBLIC_BACKEND_URL: z.string().url(),
    NEXT_PUBLIC_NAVER_ID: z.string().min(1),
    NEXT_PUBLIC_KAKAO_REST_API_KEY: z.string().min(1),
    NEXT_PUBLIC_KAKAO_REDIRECT_URL: z.string().url(),
  },

  /**
   * 런타임 환경변수 매핑.
   * createEnv의 타입 안전성을 위해 명시적으로 매핑.
   */
  runtimeEnv: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_NAVER_ID: process.env.NEXT_PUBLIC_NAVER_ID,
    NEXT_PUBLIC_KAKAO_REST_API_KEY: process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY,
    NEXT_PUBLIC_KAKAO_REDIRECT_URL: process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URL,
  },

  /**
   * 테스트·CI 환경에서는 환경변수 검증을 건너뛴다.
   * - VITEST: Vitest 실행 시 자동 설정
   * - SKIP_ENV_VALIDATION: CI/Docker 빌드 시 수동 설정
   */
  skipValidation: process.env.VITEST === 'true' || !!process.env.SKIP_ENV_VALIDATION,
});
