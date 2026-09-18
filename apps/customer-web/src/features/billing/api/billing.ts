import type { Schemas } from '@carry/types';
import { ApiError, newIdempotencyKey } from '@carry/api';
import { createV2Client } from '@shared/api/v2-client';
import type { BillingKey } from '../types/billing';

/**
 * 빌링키(자동결제 카드) API.
 *
 * - [registerBillingKey] PG SDK 카드 등록창 결과 authKey를 넘겨 빌링키를 등록한다.
 *   mock PG: 백엔드 스텁이 authKey 문자열을 그대로 수용한다(실 Toss 배선 전까지 임의 값 허용).
 * - [getMyBillingKey] 등록된 카드(마스킹 정보)를 조회한다. 미등록(404)이면 null.
 */

type V2BillingKey = Schemas['BillingKeyResponse'];

function toBillingKey(res: V2BillingKey): BillingKey {
  return {
    cardCompany: res.cardCompany,
    cardLast4: res.cardLast4,
    registeredAt: res.registeredAt,
  };
}

export async function registerBillingKey({
  accessToken,
  authKey,
}: {
  accessToken: string;
  authKey: string;
}): Promise<BillingKey> {
  const client = createV2Client({ accessToken });
  const data = await client.request<V2BillingKey>('/api/v2/billing-keys', {
    method: 'POST',
    idempotencyKey: newIdempotencyKey(),
    body: { authKey },
  });
  return toBillingKey(data);
}

export async function getMyBillingKey({
  accessToken,
}: {
  accessToken: string;
}): Promise<BillingKey | null> {
  const client = createV2Client({ accessToken });
  try {
    const data = await client.request<V2BillingKey>('/api/v2/billing-keys/me', {
      method: 'GET',
      cache: 'no-cache',
    });
    return toBillingKey(data);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
