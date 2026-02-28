'use client';

import { useState } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export default function ReactQueryProviders({ children }: React.PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // SSR에서는 staleTime > 0으로 설정하여 클라이언트 즉시 리페치 방지
            staleTime: 60 * 1000,
            // 가비지 컬렉션 타임 — 비활성 쿼리 5분 캐시 유지
            gcTime: 5 * 60 * 1000,
            // 최대 2회 재시도 — 모바일 환경 일시적 네트워크 오류 대응
            retry: 2,
            // 지수 백오프 — 1초, 2초, 최대 10초 간격으로 재시도
            retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
          },
          mutations: {
            // 변경 작업은 1회만 재시도 — 중복 요청 위험 최소화
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
