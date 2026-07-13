'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
// 주의: 배럴(../index)이 아니라 api/lib을 직접 import한다.
// index.ts가 이 훅을 re-export하므로 ../index를 거치면 순환 참조가 된다.
import { registerBillingKey } from '../api/billing';
import { createMockAuthKey } from '../lib/mock-auth-key';
import { MY_BILLING_KEY_QK } from './useMyBillingKey';

export function useRegisterBillingKey() {
  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken as string | undefined;
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      registerBillingKey({ accessToken: accessToken as string, authKey: createMockAuthKey() }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MY_BILLING_KEY_QK });
    },
  });
}
