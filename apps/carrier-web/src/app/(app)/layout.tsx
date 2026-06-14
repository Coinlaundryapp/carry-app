'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@features/auth';

/**
 * authed 영역 가드 — 토큰이 없으면 /login으로 보낸다. 토큰은 localStorage에 있어
 * 클라이언트에서만 확인 가능하므로 effect로 검사하고, 확인 전엔 아무것도 렌더하지 않는다.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      setReady(true);
    } else {
      router.replace('/login');
    }
  }, [router]);

  if (!ready) return null;
  return <>{children}</>;
}
