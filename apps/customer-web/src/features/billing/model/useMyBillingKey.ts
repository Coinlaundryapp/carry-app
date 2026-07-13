'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { getMyBillingKey } from '../api/billing';

export const MY_BILLING_KEY_QK = ['billingKey', 'me'] as const;

export function useMyBillingKey() {
  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken as string | undefined;
  return useQuery({
    queryKey: MY_BILLING_KEY_QK,
    queryFn: () => getMyBillingKey({ accessToken: accessToken as string }),
    enabled: !!accessToken,
  });
}
