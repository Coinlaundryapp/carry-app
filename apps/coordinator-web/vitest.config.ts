/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@features': path.resolve(__dirname, 'src/features'),
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: true,
    // @carry/api와 auth fetch는 node 전역 fetch(절대 URL 필요)를 쓴다. msw는 host 무관
    // 매칭이므로 테스트용 베이스 URL을 주입한다(prod는 실제 NEXT_PUBLIC_BACKEND_URL 사용).
    env: {
      NEXT_PUBLIC_BACKEND_URL: 'http://localhost',
    },
  },
});
