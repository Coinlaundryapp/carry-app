'use client';

import { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { createV2Client } from '@shared/api/v2-client';

/**
 * 클라이언트 컴포넌트용 v2 클라이언트 훅. NextAuth 세션의 accessToken을 주입한다.
 * 세션이 없으면 토큰 없이(비인증) 클라이언트를 반환 — public 엔드포인트 호출 가능.
 */
export function useV2Client() {
  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken;
  return useMemo(() => createV2Client({ accessToken }), [accessToken]);
}
