import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  /**
   * 서버 사이드 전용 환경변수.
   * 클라이언트 번들에 포함되지 않으며, 서버에서만 접근 가능.
   */
  server: {
    AUTH_SECRET: z.string().min(1),
    // 소셜 OAuth 앱 자격증명 — NextAuth v5가 AUTH_<PROVIDER>_ID/SECRET를 자동 로드한다.
    AUTH_KAKAO_ID: z.string(),
    AUTH_KAKAO_SECRET: z.string(),
    AUTH_NAVER_ID: z.string(),
    AUTH_NAVER_SECRET: z.string(),
    AUTH_GOOGLE_ID: z.string(),
    AUTH_GOOGLE_SECRET: z.string(),
  },

  /**
   * 클라이언트 사이드 환경변수 (NEXT_PUBLIC_ 접두사).
   * Next.js가 빌드 시 인라인하므로 클라이언트에서도 접근 가능.
   */
  client: {
    NEXT_PUBLIC_BACKEND_URL: z.string().url(),
    NEXT_PUBLIC_NAVER_ID: z.string().min(1),
  },

  /**
   * 런타임 환경변수 매핑.
   * createEnv의 타입 안전성을 위해 명시적으로 매핑.
   */
  runtimeEnv: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_KAKAO_ID: process.env.AUTH_KAKAO_ID,
    AUTH_KAKAO_SECRET: process.env.AUTH_KAKAO_SECRET,
    AUTH_NAVER_ID: process.env.AUTH_NAVER_ID,
    AUTH_NAVER_SECRET: process.env.AUTH_NAVER_SECRET,
    AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_NAVER_ID: process.env.NEXT_PUBLIC_NAVER_ID,
  },

  /**
   * 테스트·CI 환경에서는 환경변수 검증을 건너뛴다.
   * - VITEST: Vitest 실행 시 자동 설정
   * - SKIP_ENV_VALIDATION: CI/Docker 빌드 시 수동 설정
   */
  skipValidation: process.env.VITEST === 'true' || !!process.env.SKIP_ENV_VALIDATION,
});
