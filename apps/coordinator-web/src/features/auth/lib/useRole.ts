'use client';

import { useEffect, useState } from 'react';
import { createV2Client } from '@shared/api/v2-client';
import { getMe } from '../api/me';

/**
 * 현재 사용자 역할 조회 훅 — `GET /users/me`의 role 클레임으로 ADMIN 가드를 판정한다.
 * (dev-login 역할이 그대로 토큰·프로필에 반영된다.)
 *
 * 반환: { role, isAdmin, loading }. 미인증/오류 시 role=null.
 */
export function useRole() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const me = await getMe(createV2Client());
        if (alive) setRole(me.role ?? null);
      } catch {
        if (alive) setRole(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return { role, isAdmin: role === 'ADMIN', loading };
}
