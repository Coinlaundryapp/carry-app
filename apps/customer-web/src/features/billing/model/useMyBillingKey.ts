'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { getMyBillingKey } from '../api/billing';

export const MY_BILLING_KEY_QK = ['billingKey', 'me'] as const;

export function useMyBillingKey() {
  const { data: session, status } = useSession();
  const accessToken = session?.user?.accessToken as string | undefined;
  const query = useQuery({
    queryKey: MY_BILLING_KEY_QK,
    queryFn: () => getMyBillingKey({ accessToken: accessToken as string }),
    enabled: !!accessToken,
  });
  // 세션 해석 중(status==='loading')엔 카드 유무가 아직 미확정 — enabled=false로 query.isLoading이
  // false가 되는 창을 메워 소비자가 '카드 없음'으로 조기 판정하지 않게 한다.
  return { ...query, isLoading: query.isLoading || status === 'loading' };
}
