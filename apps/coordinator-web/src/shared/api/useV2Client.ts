'use client';

import { useMemo } from 'react';
import { createV2Client } from '@shared/api/v2-client';

/**
 * 클라이언트 컴포넌트용 v2 클라이언트 훅. 토큰은 [tokenStore]가 요청 시점에 localStorage에서
 * 읽으므로 클라이언트 인스턴스는 안정적이다(토큰 상태에 의존하지 않음).
 */
export function useV2Client() {
  return useMemo(() => createV2Client(), []);
}
