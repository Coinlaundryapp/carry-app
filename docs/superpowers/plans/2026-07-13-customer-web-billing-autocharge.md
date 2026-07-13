# customer-web 빌링키 자동과금 정합 — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** customer-web을 백엔드 빌링키 자동과금 계약(carry-platform PR #157)에 맞춘다 — 주문 제출 시 카드 등록 인터셉, 배송·결제 2지표 상태 표시, 수동 결제창 제거·영수증화, 카드 관리·연체 해소.

**Architecture:** 기존 strangler/anti-corruption 패턴 유지(생성 타입 → 앱 `to*` 매퍼). 신규 `features/billing`(등록·조회·변경) + `features/order` 제출 인터셉 + `features/status` 2지표 재편 + `features/payment` 영수증 용도변경. mock 등록(실 Toss `requestBillingAuth`는 주석 심).

**Tech Stack:** Next.js 14 App Router, React Query 5, Zustand 4, Tailwind + CVA, NextAuth v5, `@carry/api`(fetch 래퍼)·`@carry/types`(openapi-typescript 생성), Vitest + MSW(단위), Playwright(e2e).

**Spec:** `docs/superpowers/specs/2026-07-13-customer-web-billing-autocharge-design.md`

**공통 규칙:**
- 패키지 매니저 **pnpm**, 모노레포(turborepo). customer-web 작업 디렉터리: `apps/customer-web`.
- 커밋: conventional prefix(영어) + 한국어 본문. `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`. lint-staged 훅이 동작하니 커밋 전 스테이징된 파일만 커밋.
- 브랜치: `feat/customer-web-billing-autocharge`(스펙 이미 커밋됨).
- 타입 검사: `pnpm --filter customer-web exec tsc --noEmit`. 단위 테스트: `pnpm --filter customer-web test`(Vitest). ⚠️ Vitest도 매칭 0건이면 통과처럼 보이니 실행된 테스트 수를 출력으로 확인.
- 앱 상태 필드(`OrderResponse.status` 등)는 openapi에서 `string`이라 생성 타입에 리터럴 union이 없다 — 앱 상수(Task 2)로 정의.

---

## Chunk 1: 타입 재생성 + billing 기반

### Task 1: 타입 재생성 + totalAmount 파급 수정

생성 타입을 백엔드 최신 계약으로 갱신한다. `OrderResponse`에서 `totalAmount`가 사라지고 `/api/v2/billing-keys`·`BillingKeyResponse`가 추가되며 `/api/v2/payments/pay`가 사라진다. **regen 즉시 `order.totalAmount` 참조 2곳이 TS 에러**가 되므로 같은 커밋에서 고쳐 컴파일을 유지한다.

**Files:**
- Modify(생성): `packages/types/src/generated/v2.ts` (직접 편집 금지 — `pnpm gen:types`로 재생성)
- Modify: `apps/customer-web/src/features/status/api/getOrderDetail.ts:52`
- Modify: `apps/customer-web/src/features/status/api/getOrderList.ts:28`
- Modify: `apps/customer-web/src/features/status/api/status-api.test.ts` (netAmount 단언 갱신 — 아래 Step 4)

- [ ] **Step 1: 타입 재생성**

레포 루트에서 실행:
```bash
pnpm gen:types
```
(스크립트: `openapi-typescript ../carry-platform/docs/api/openapi-v2.json -o packages/types/src/generated/v2.ts`.) 생성 후 확인: `packages/types/src/generated/v2.ts`에 `"/api/v2/billing-keys"` 경로와 `BillingKeyResponse` 스키마가 존재하고, `"/api/v2/payments/pay"`가 사라지고, `Schemas['OrderResponse']`에 `totalAmount`가 없어야 한다. 없으면 백엔드 openapi가 아직 구버전 — 중단하고 보고(BLOCKED).

- [ ] **Step 2: tsc로 파급 확인**

Run: `pnpm --filter customer-web exec tsc --noEmit`
Expected: `getOrderDetail.ts:52`, `getOrderList.ts:28`의 `order.totalAmount` 관련 에러(Property 'totalAmount' does not exist).

- [ ] **Step 3: 두 매퍼 수정**

`getOrderDetail.ts`의 `paymentDetails.netAmount: order.totalAmount ?? 0` → `netAmount: 0`으로 변경하고 위에 주석: `// 금액은 인보이스 조회로 이관(Task 8) — 주문 응답엔 더 이상 없음`. `getOrderList.ts:28`도 동일하게 `netAmount: 0`. (목록은 금액 미표시가 최종 — Task 8에서 확정.)

- [ ] **Step 4: 깨지는 테스트 단언 갱신**

`status-api.test.ts`가 `expect(result.paymentDetails.netAmount).toBe(order.totalAmount)`(=15000)를 단언한다. 매퍼가 `netAmount: 0`이 됐으므로 이 단언을 `toBe(0)`으로 바꾸거나 삭제(금액은 Task 8에서 인보이스로 이관되므로 주문 매퍼 금액 단언은 의미 없음). ⚠️ 이건 tsc에 안 잡히고(픽스처가 untyped literal) 런타임 실패로만 드러난다. 겸사겸사 `src/test/mocks/handlers.ts`의 `mockOrderResponse`에서 죽은 `totalAmount: 15000`도 제거.

- [ ] **Step 5: tsc + 기존 테스트 통과 확인**

Run: `pnpm --filter customer-web exec tsc --noEmit`
Expected: 에러 없음.
Run: `pnpm --filter customer-web test`
Expected: 기존 테스트 전부 통과(실행 수 > 0 확인).

- [ ] **Step 6: Commit**

```bash
git add packages/types/src/generated/v2.ts apps/customer-web/src/features/status/api/getOrderDetail.ts apps/customer-web/src/features/status/api/getOrderList.ts apps/customer-web/src/features/status/api/status-api.test.ts apps/customer-web/src/test/mocks/handlers.ts
git commit -m "feat: openapi 타입 재생성 — 빌링키 계약 반영, OrderResponse.totalAmount 제거 파급 수정"
```

### Task 2: 앱 상태 상수

백엔드 status 문자열을 앱 상수로 정의(생성 타입에 리터럴 없음). 이후 매퍼가 이 상수를 참조.

**Files:**
- Create: `apps/customer-web/src/features/status/lib/status-constants.ts`
- Test: `apps/customer-web/src/features/status/lib/status-constants.test.ts`

- [ ] **Step 1: 실패 테스트 작성**

```ts
import { describe, it, expect } from 'vitest';
import { ORDER_STATUS, INVOICE_STATUS, PAYMENT_STATUS } from './status-constants';

describe('status-constants', () => {
  it('주문 물리 상태 6종을 정의한다', () => {
    expect(Object.values(ORDER_STATUS)).toEqual([
      'CREATED', 'DISPATCHED', 'PICKED_UP', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED',
    ]);
  });
  it('인보이스 상태 5종을 정의한다', () => {
    expect(Object.values(INVOICE_STATUS)).toEqual([
      'ISSUED', 'PAID', 'OVERDUE', 'CANCELLED', 'REFUNDED',
    ]);
  });
  it('결제 상태 5종을 정의한다', () => {
    expect(Object.values(PAYMENT_STATUS)).toEqual([
      'PENDING', 'COMPLETED', 'FAILED', 'REFUND_PENDING', 'REFUNDED',
    ]);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `pnpm --filter customer-web test status-constants`
Expected: FAIL (모듈 없음).

- [ ] **Step 3: 구현**

```ts
// 백엔드 OrderEnums.kt / PaymentEnums.kt 와 대조해 확정한 값. openapi가 status를 string 으로만
// 노출하므로 앱에서 리터럴을 직접 정의한다.
export const ORDER_STATUS = {
  CREATED: 'CREATED', DISPATCHED: 'DISPATCHED', PICKED_UP: 'PICKED_UP',
  IN_PROGRESS: 'IN_PROGRESS', COMPLETED: 'COMPLETED', CANCELLED: 'CANCELLED',
} as const;
export const INVOICE_STATUS = {
  ISSUED: 'ISSUED', PAID: 'PAID', OVERDUE: 'OVERDUE', CANCELLED: 'CANCELLED', REFUNDED: 'REFUNDED',
} as const;
export const PAYMENT_STATUS = {
  PENDING: 'PENDING', COMPLETED: 'COMPLETED', FAILED: 'FAILED',
  REFUND_PENDING: 'REFUND_PENDING', REFUNDED: 'REFUNDED',
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
export type InvoiceStatus = (typeof INVOICE_STATUS)[keyof typeof INVOICE_STATUS];
export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];
```

- [ ] **Step 4: 통과 확인 + Commit**

Run: `pnpm --filter customer-web test status-constants`
Expected: PASS (tests=3).
```bash
git add apps/customer-web/src/features/status/lib/status-constants.ts apps/customer-web/src/features/status/lib/status-constants.test.ts
git commit -m "feat: 주문/인보이스/결제 상태 앱 상수 정의"
```

### Task 3: billing API (등록·조회·매퍼·목 authKey)

**Files:**
- Create: `apps/customer-web/src/features/billing/types/billing.ts`
- Create: `apps/customer-web/src/features/billing/lib/mock-auth-key.ts`
- Create: `apps/customer-web/src/features/billing/api/billing.ts`
- Create: `apps/customer-web/src/features/billing/index.ts`
- Test: `apps/customer-web/src/features/billing/api/billing.test.ts`

- [ ] **Step 1: 실패 테스트 작성** (`billing.test.ts`, `payment.test.ts` 패턴 준용 — MSW `server.use`)

```ts
import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { registerBillingKey, getMyBillingKey } from './billing';

const TOKEN = 'test-access-token';

describe('registerBillingKey', () => {
  it('authKey로 등록하고 마스킹 카드를 반환한다', async () => {
    server.use(
      http.post('*/api/v2/billing-keys', () =>
        HttpResponse.json({ status: 201, code: 'OK', message: '', data: {
          cardCompany: '신한', cardLast4: '1234', registeredAt: '2026-07-13T00:00:00Z',
        }}, { status: 201 }),
      ),
    );
    const result = await registerBillingKey({ accessToken: TOKEN, authKey: 'mock-x' });
    expect(result).toEqual({ cardCompany: '신한', cardLast4: '1234', registeredAt: '2026-07-13T00:00:00Z' });
  });
});

describe('getMyBillingKey', () => {
  it('등록 카드를 반환한다', async () => {
    server.use(
      http.get('*/api/v2/billing-keys/me', () =>
        HttpResponse.json({ status: 200, code: 'OK', message: '', data: {
          cardCompany: '국민', cardLast4: '5678', registeredAt: '2026-07-13T00:00:00Z',
        }}, { status: 200 }),
      ),
    );
    expect(await getMyBillingKey({ accessToken: TOKEN })).toMatchObject({ cardLast4: '5678' });
  });
  it('404면 null을 반환한다(카드 없음)', async () => {
    server.use(
      http.get('*/api/v2/billing-keys/me', () =>
        HttpResponse.json({ status: 404, code: 'BILLING_KEY_NOT_FOUND', message: '없음' }, { status: 404 }),
      ),
    );
    expect(await getMyBillingKey({ accessToken: TOKEN })).toBeNull();
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `pnpm --filter customer-web test billing`
Expected: FAIL (모듈 없음).

- [ ] **Step 3: 구현**

`types/billing.ts`:
```ts
export type BillingKey = {
  cardCompany: string;
  cardLast4: string;
  registeredAt: string;
};
```

`lib/mock-auth-key.ts`:
```ts
// mock PG: 백엔드 스텁이 authKey 문자열을 그대로 수용하므로 임의 값을 만든다.
// 실 Toss 배선(주석 심): 등록 시 아래로 교체 — PG 콘솔 준비 시.
//   const tossPayments = await loadTossPayments(clientKey);
//   const { authKey } = await tossPayments.requestBillingAuth({ customerKey, ... });
export function createMockAuthKey(): string {
  return `mock-auth-${crypto.randomUUID()}`;
}
```

`api/billing.ts` (`ApiError`는 `@carry/api`; 404→null):
```ts
import type { Schemas } from '@carry/types';
import { ApiError, newIdempotencyKey } from '@carry/api';
import { createV2Client } from '@shared/api/v2-client';
import type { BillingKey } from '../types/billing';

type V2BillingKey = Schemas['BillingKeyResponse'];

function toBillingKey(res: V2BillingKey): BillingKey {
  return { cardCompany: res.cardCompany, cardLast4: res.cardLast4, registeredAt: res.registeredAt };
}

export async function registerBillingKey({ accessToken, authKey }: {
  accessToken: string; authKey: string;
}): Promise<BillingKey> {
  const client = createV2Client({ accessToken });
  const data = await client.request<V2BillingKey>('/api/v2/billing-keys', {
    method: 'POST', idempotencyKey: newIdempotencyKey(), body: { authKey },
  });
  return toBillingKey(data);
}

export async function getMyBillingKey({ accessToken }: {
  accessToken: string;
}): Promise<BillingKey | null> {
  const client = createV2Client({ accessToken });
  try {
    const data = await client.request<V2BillingKey>('/api/v2/billing-keys/me', {
      method: 'GET', cache: 'no-cache',
    });
    return toBillingKey(data);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
```
(⚠️ `BillingKeyResponse` 필드명은 Task 1 재생성본에서 확인해 맞출 것 — cardCompany/cardLast4/registeredAt.)

`index.ts`:
```ts
export { registerBillingKey, getMyBillingKey } from './api/billing';
export { createMockAuthKey } from './lib/mock-auth-key';
export type { BillingKey } from './types/billing';
```

- [ ] **Step 4: 통과 확인 + Commit**

Run: `pnpm --filter customer-web test billing`
Expected: PASS (tests=3).
```bash
git add apps/customer-web/src/features/billing/
git commit -m "feat: billing API — 빌링키 등록·조회(404→null)·목 authKey"
```

### Task 4: billing 훅 + 등록 시트 UI

**Files:**
- Create: `apps/customer-web/src/features/billing/model/useMyBillingKey.ts`
- Create: `apps/customer-web/src/features/billing/model/useRegisterBillingKey.ts`
- Create: `apps/customer-web/src/features/billing/ui/BillingKeyRegistrationSheet.tsx`
- Modify: `apps/customer-web/src/features/billing/index.ts`
- Test: `apps/customer-web/src/features/billing/model/useMyBillingKey.test.ts`

- [ ] **Step 1: 훅 구현** (앱에 기존 use*.ts 훅이 없으므로 신규 관례를 만든다 — `useSession`으로 토큰, React Query)

`useMyBillingKey.ts`:
```ts
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
```

`useRegisterBillingKey.ts` (성공 시 `MY_BILLING_KEY_QK` 무효화 — 앱 최초의 `invalidateQueries` 도입):
```ts
'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { registerBillingKey, createMockAuthKey } from '../index';
import { MY_BILLING_KEY_QK } from './useMyBillingKey';

export function useRegisterBillingKey() {
  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken as string | undefined;
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => registerBillingKey({ accessToken: accessToken as string, authKey: createMockAuthKey() }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: MY_BILLING_KEY_QK }); },
  });
}
```

- [ ] **Step 2: 훅 테스트** (React Query + MSW; QueryClientProvider 래퍼 + next-auth/react 목 — setup.ts는 next-auth를 목하지 않으므로 테스트 파일에서 `vi.mock('next-auth/react', ...)`)

```tsx
import { describe, it, expect, vi } from 'vitest';
import { type ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { useMyBillingKey } from './useMyBillingKey';

vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { accessToken: 'test-access-token' } } }),
}));

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('useMyBillingKey', () => {
  it('등록 카드를 조회한다', async () => {
    server.use(http.get('*/api/v2/billing-keys/me', () =>
      HttpResponse.json({ status: 200, code: 'OK', message: '', data: {
        cardCompany: '신한', cardLast4: '1234', registeredAt: '2026-07-13T00:00:00Z' } }, { status: 200 })));
    const { result } = renderHook(() => useMyBillingKey(), { wrapper });
    await waitFor(() => expect(result.current.data).toMatchObject({ cardLast4: '1234' }));
  });
});
```
(이 테스트 파일은 `.test.tsx`가 아니라 JSX를 쓰므로 확장자는 `.test.tsx`로 만들 것.) 파일명 정정: `useMyBillingKey.test.tsx`.

- [ ] **Step 3: 등록 시트 UI** (`OrderSubmitDrawer`의 `vaul` Drawer + 기존 `CARD_INSTITUTIONS` 재사용)

`BillingKeyRegistrationSheet.tsx` — props `{ open: boolean; onOpenChange: (o: boolean) => void; onSuccess: () => void }`. 카드사 선택(Dropdown over `CARD_INSTITUTIONS`) + 카드번호 입력(형식 검증만, 값은 미전송 — 목이라 authKey만 필요) → "카드 등록" 버튼 → `useRegisterBillingKey().mutate()` → `onSuccess`(성공)/토스트(실패). 등록 성공 시 마스킹 카드(`cardLast4`) 노출 후 `onSuccess()` 호출로 닫기. 기존 UI 프리미티브(`Button`, `Drawer*`, `Dropdown`, `useToastStore`) 재사용. (실제 카드번호는 목이므로 백엔드로 보내지 않음 — 시각적 폼일 뿐. 주석으로 명시.)

- [ ] **Step 4: index.ts 갱신 + 테스트 통과 확인**

`index.ts`에 `useMyBillingKey`, `useRegisterBillingKey`, `BillingKeyRegistrationSheet`, `MY_BILLING_KEY_QK` 추가.
Run: `pnpm --filter customer-web test useMyBillingKey` → PASS.
Run: `pnpm --filter customer-web exec tsc --noEmit` → 에러 없음.

- [ ] **Step 5: Commit**

```bash
git add apps/customer-web/src/features/billing/
git commit -m "feat: billing 훅(useMyBillingKey/useRegisterBillingKey) + 카드 등록 시트"
```

---

## Chunk 2: 주문 인터셉 + 상태 2지표

### Task 5: postOrder 에러 전파 + 에러 코드 상수

**Files:**
- Modify: `apps/customer-web/src/features/order/api/order.ts:114-129`
- Create: `apps/customer-web/src/features/order/lib/error-codes.ts`
- Test: `apps/customer-web/src/features/order/api/order.test.ts` (추가)

- [ ] **Step 1: 실패 테스트 추가** (`order.test.ts`에 409 전파 케이스)

```ts
import { ApiError } from '@carry/api';
// ...
it('createOrder 409 시 ApiError를 코드와 함께 전파한다', async () => {
  server.use(http.post('*/api/v2/orders', () =>
    HttpResponse.json({ status: 409, code: 'BILLING_KEY_REQUIRED', message: '카드 필요' }, { status: 409 })));
  await expect(postOrder({ accessToken: 'test-access-token', orderContent: /* 기존 픽스처 */, laundromatId: 1, addressId: 1, orderSchedule: /* 기존 */ }))
    .rejects.toMatchObject({ code: 'BILLING_KEY_REQUIRED' });
});
```
(기존 order.test.ts의 픽스처/헬퍼 재사용.)

- [ ] **Step 2: 실패 확인**

Run: `pnpm --filter customer-web test order`
Expected: FAIL — 현재 `catch`가 `new Error('주문에 실패했습니다.')`로 삼켜 `code`가 없음.

- [ ] **Step 3: 구현**

`order.ts`의 `postOrder`에서 `try/catch`(114-129) 제거 — `client.request`가 던지는 `ApiError`를 그대로 전파:
```ts
export async function postOrder({ ... }): Promise<V2Order> {
  const client = createV2Client({ accessToken });
  return client.request<V2Order>('/api/v2/orders', {
    method: 'POST', idempotencyKey: newIdempotencyKey(),
    body: { /* 기존 그대로 */ },
  });
}
```

`lib/error-codes.ts`:
```ts
export const ORDER_ERROR_CODE = {
  BILLING_KEY_REQUIRED: 'BILLING_KEY_REQUIRED',
  OVERDUE_INVOICE_EXISTS: 'OVERDUE_INVOICE_EXISTS',
} as const;
```

- [ ] **Step 4: 통과 확인 + Commit**

Run: `pnpm --filter customer-web test order`
Expected: PASS (신규 + 기존). 기존 "주문 실패" 케이스가 특정 메시지를 단언했다면 `ApiError` 전파에 맞게 갱신.
```bash
git add apps/customer-web/src/features/order/api/order.ts apps/customer-web/src/features/order/lib/error-codes.ts apps/customer-web/src/features/order/api/order.test.ts
git commit -m "fix: postOrder가 ApiError를 전파하도록 — 409 인터셉 가능화 + 주문 에러코드 상수"
```

### Task 6: 주문 제출 인터셉 (OrderSubmitDrawer)

**Files:**
- Modify: `apps/customer-web/src/features/order/ui/OrderSubmitDrawer.tsx`
- Test: `apps/customer-web/src/features/order/ui/OrderSubmitDrawer.test.tsx`

- [ ] **Step 1: 인터셉 로직 구현**

`OrderSubmitDrawer.tsx` 확정 핸들러 재작성:
1. `const { data: billingKey, isLoading } = useMyBillingKey();` — `data`는 로딩 중 `undefined`, 카드 없음 `null`, 있음 `BillingKey`.
2. **로딩 가드**: `isLoading`이면 확정 버튼 `disabled`(빌링키 조회 미완 상태에서 클릭 방지).
3. 확정 클릭 시: `billingKey == null`(undefined/null 모두)이면 `BillingKeyRegistrationSheet` 오픈(로컬 `useState`), 시트 `onSuccess`에서 `mutation.mutate()` 이어 실행. 있으면 바로 `mutation.mutate()`.
4. `mutation.onError`에서 `error instanceof ApiError`면 `error.code` 분기:
   - `ORDER_ERROR_CODE.BILLING_KEY_REQUIRED` → 등록 시트 오픈(레이스 폴백).
   - `ORDER_ERROR_CODE.OVERDUE_INVOICE_EXISTS` → `router.push('/billing/overdue')`(Task 11).
   - 그 외 → 기존 토스트.
5. `onSuccess` → `reset()` + `router.replace('/status/${data.id}')`(기존 유지).

⚠️ **Drawer 구조 주의**: 현재 확정 버튼은 `<DrawerClose asChild>` 안에 있어 클릭 시 무조건 Drawer를 닫고 `DrawerContent`를 언마운트한다. 인터셉을 위해: (a) 확정 버튼에서 `DrawerClose` 래퍼를 제거하고(직접 `onClick` 핸들러로 분기 처리 — 카드 있으면 제출 후 성공 시 라우팅이 닫음, 없으면 시트 오픈), (b) `BillingKeyRegistrationSheet`는 **바깥 `<Drawer>`의 형제**(최상위)로 렌더해 Drawer가 닫혀도 시트가 유지되게 한다.

- [ ] **Step 2: 컴포넌트 테스트** (`.test.tsx`, MSW + next-auth 목 + QueryClientProvider; 앱 최초 컴포넌트 테스트)

⚠️ **네비게이션 목**: `setup.ts`의 `next/navigation` 목은 `useRouter()` 호출마다 **새 spy 객체**를 반환해 테스트가 같은 spy를 잡을 수 없다. 테스트 파일에서 모듈 레벨 안정 spy로 재목(override):
```tsx
const replace = vi.fn(); const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, push, back: vi.fn(), refresh: vi.fn(), prefetch: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock('next-auth/react', () => ({ useSession: () => ({ data: { user: { accessToken: 'test-access-token' } } }) }));
```
케이스(RTL `render` + `userEvent`, `beforeEach`에서 spy `mockClear`):
- 카드 있음(`/me` 200) → 확정 클릭 → `POST /api/v2/orders` 호출됨 → `expect(replace).toHaveBeenCalledWith('/status/…')`.
- 카드 없음(`/me` 404) → 확정 클릭 → 등록 시트 노출(등록 버튼 보임), 주문 미호출.
- createOrder 409 OVERDUE(`/me` 200 + orders 409) → `expect(push).toHaveBeenCalledWith('/billing/overdue')`.

- [ ] **Step 3: 실패→통과**

Run: `pnpm --filter customer-web test OrderSubmitDrawer`
먼저 FAIL(미구현 분기) 확인 후 구현 완성 → PASS.

- [ ] **Step 4: tsc + Commit**

Run: `pnpm --filter customer-web exec tsc --noEmit` → 에러 없음.
```bash
git add apps/customer-web/src/features/order/ui/OrderSubmitDrawer.tsx apps/customer-web/src/features/order/ui/OrderSubmitDrawer.test.tsx
git commit -m "feat: 주문 제출 빌링키 인터셉 — 미등록 시 등록 시트, 409(연체) 라우팅"
```

### Task 7: 상태 매퍼 (배송 진행 · 결제 배지)

**Files:**
- Create: `apps/customer-web/src/features/status/lib/status-mappers.ts`
- Test: `apps/customer-web/src/features/status/lib/status-mappers.test.ts`

- [ ] **Step 1: 실패 테스트 작성** (조합표 — 경계 포함)

```ts
import { describe, it, expect } from 'vitest';
import { toDeliveryProgress, toPaymentBadge } from './status-mappers';

describe('toDeliveryProgress', () => {
  it.each([
    ['CREATED', '수거 대기'], ['DISPATCHED', '수거 대기'], ['PICKED_UP', '수거 완료'],
    ['IN_PROGRESS', '세탁·배송중'], ['COMPLETED', '완료'], ['CANCELLED', '취소'],
  ])('%s → %s', (status, label) => {
    expect(toDeliveryProgress(status).label).toBe(label);
  });
  it('모르는 값은 수거 대기로 안전 처리', () => {
    expect(toDeliveryProgress('WEIRD').label).toBe('수거 대기');
  });
});

describe('toPaymentBadge', () => {
  it('인보이스 없음 → null(숨김)', () => {
    expect(toPaymentBadge(null, null)).toBeNull();
  });
  it('PAID → 결제 완료', () => {
    expect(toPaymentBadge({ status: 'PAID', totalAmount: 24500 } as any, { status: 'COMPLETED' } as any))
      .toMatchObject({ label: '결제 완료', tone: 'success', amount: 24500 });
  });
  it('FAILED → 결제 실패(배너 대상)', () => {
    expect(toPaymentBadge({ status: 'ISSUED' } as any, { status: 'FAILED' } as any))
      .toMatchObject({ label: '결제 실패', tone: 'danger' });
  });
  it('OVERDUE → 연체(배너 대상)', () => {
    expect(toPaymentBadge({ status: 'OVERDUE' } as any, null)).toMatchObject({ label: '연체', tone: 'danger' });
  });
  it('REFUND_PENDING → 환불 처리중', () => {
    expect(toPaymentBadge({ status: 'PAID' } as any, { status: 'REFUND_PENDING' } as any))
      .toMatchObject({ label: '환불 처리중' });
  });
  it('REFUNDED → 환불 완료', () => {
    expect(toPaymentBadge({ status: 'REFUNDED' } as any, { status: 'REFUNDED' } as any))
      .toMatchObject({ label: '환불 완료' });
  });
  it('ISSUED + PENDING → 결제 처리중(fallthrough)', () => {
    expect(toPaymentBadge({ status: 'ISSUED' } as any, { status: 'PENDING' } as any))
      .toMatchObject({ label: '결제 처리중', needsAction: false });
  });
  it('Invoice CANCELLED(미과금 취소) → null(배지 숨김)', () => {
    expect(toPaymentBadge({ status: 'CANCELLED' } as any, null)).toBeNull();
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `pnpm --filter customer-web test status-mappers` → FAIL.

- [ ] **Step 3: 구현**

```ts
import { ORDER_STATUS, INVOICE_STATUS, PAYMENT_STATUS } from './status-constants';
import type { Schemas } from '@carry/types';

export type DeliveryProgress = { label: string; step: number; cancelled: boolean };
export type PaymentBadge = { label: string; tone: 'success' | 'info' | 'danger'; amount?: number; needsAction: boolean };

export function toDeliveryProgress(orderStatus: string): DeliveryProgress {
  switch (orderStatus) {
    case ORDER_STATUS.PICKED_UP: return { label: '수거 완료', step: 2, cancelled: false };
    case ORDER_STATUS.IN_PROGRESS: return { label: '세탁·배송중', step: 3, cancelled: false };
    case ORDER_STATUS.COMPLETED: return { label: '완료', step: 4, cancelled: false };
    case ORDER_STATUS.CANCELLED: return { label: '취소', step: 0, cancelled: true };
    case ORDER_STATUS.DISPATCHED:
    case ORDER_STATUS.CREATED:
    default: return { label: '수거 대기', step: 1, cancelled: false };
  }
}

// invoice 404(수거 전) → 둘 다 null 로 전달됨 → null 반환(배지 숨김)
export function toPaymentBadge(
  invoice: Pick<Schemas['InvoiceResponse'], 'status' | 'totalAmount'> | null,
  payment: Pick<Schemas['PaymentResponse'], 'status'> | null,
): PaymentBadge | null {
  if (!invoice) return null;
  const inv = invoice.status, pay = payment?.status;
  if (inv === INVOICE_STATUS.REFUNDED || pay === PAYMENT_STATUS.REFUNDED)
    return { label: '환불 완료', tone: 'info', needsAction: false };
  if (pay === PAYMENT_STATUS.REFUND_PENDING)
    return { label: '환불 처리중', tone: 'info', needsAction: false };
  if (inv === INVOICE_STATUS.OVERDUE)
    return { label: '연체', tone: 'danger', needsAction: true };
  if (pay === PAYMENT_STATUS.FAILED)
    return { label: '결제 실패', tone: 'danger', needsAction: true };
  if (inv === INVOICE_STATUS.PAID || pay === PAYMENT_STATUS.COMPLETED)
    return { label: '결제 완료', tone: 'success', amount: invoice.totalAmount, needsAction: false };
  if (inv === INVOICE_STATUS.CANCELLED) return null; // 미과금 취소 → 배지 없음
  return { label: '결제 처리중', tone: 'info', needsAction: false }; // ISSUED/PENDING 등
}
```

- [ ] **Step 4: 통과 확인 + Commit**

Run: `pnpm --filter customer-web test status-mappers` → PASS.
```bash
git add apps/customer-web/src/features/status/lib/status-mappers.ts apps/customer-web/src/features/status/lib/status-mappers.test.ts
git commit -m "feat: 상태 매퍼 — 배송 진행/결제 배지(환불·연체·실패 조합)"
```

### Task 8: StatusCard 2지표 재편 + 상세 인보이스 조회

**Files:**
- Modify: `apps/customer-web/src/features/status/ui/StatusCard.tsx`
- Modify: `apps/customer-web/src/app/(fullscreen)/status/[id]/page.tsx`
- Modify: `apps/customer-web/src/app/(fullscreen)/status/page.tsx`
- Test: `apps/customer-web/src/features/status/ui/StatusCard.test.tsx`

- [ ] **Step 1: StatusCard 재작성**

props를 `{ variant: 'list' | 'detail'; orderStatus: string; paymentBadge?: PaymentBadge | null; info: OrderDetailRes | OrderListRes; hasButton: boolean }`로 변경.
- 배송 진행: `toDeliveryProgress(orderStatus)`로 단계 인디케이터(4단계, 취소는 별도 종결 배지).
- 결제 배지: `variant === 'detail'`이고 `paymentBadge`가 있으면 배지 + `paymentBadge.amount`(있으면 `{amount}원`, 현재 `{}원` 스텁 제거). `variant === 'list'`이면 배지 미표시.
- `paymentBadge.needsAction`이면 "카드 확인 필요" 배너 + CTA(→ `/my/payment` 또는 `/billing/overdue`).
구 `status`/`LaundryStatusType` 인라인 라벨 매핑 제거.

- [ ] **Step 2: 상세 페이지 인보이스 병렬 조회 + 낡은 헤더 정리**

`status/[id]/page.tsx`: 기존 `getOrderDetail` 쿼리에 더해 `getInvoiceStatus`(Step 3에서 정의) 병렬 `useQuery`:
```ts
const invoiceQ = useQuery({
  queryKey: ['invoiceStatus', orderId],
  queryFn: () => getInvoiceStatus(accessToken, Number(orderId)), // { invoice, payment } — 각 404는 null
  enabled: !!accessToken,
  retry: false,
});
const badge = toPaymentBadge(invoiceQ.data?.invoice ?? null, invoiceQ.data?.payment ?? null);
```
`<StatusCard variant="detail" orderStatus={orderDetail!.status} paymentBadge={badge} info={orderDetail!} hasButton={false} />`.
⚠️ **낡은 헤더 제거**: 이 페이지 상단(현재 30–54행)의 제목/부제 조건 블록은 구 어휘(`ORDER_CANCELED/ORDER_COMPLETED/PAYMENT_COMPLETED/REFUND_*`)에 keyed돼 있고 "세탁 진행 후 결제를 해주셔야…" 배너는 자동과금 모델과 모순된다. 물리 6상태에선 모두 false로 평가돼 빈 헤더 + 틀린 배너가 남는다. 이 블록을 `toDeliveryProgress(orderDetail.status).label` 기반 제목으로 재작성하고 결제 안내 배너는 삭제한다.

- [ ] **Step 3: 원본 상태 보존 조회 함수 `getInvoiceStatus`**

`features/payment/api/payment.ts`의 `getPaymentInfo`는 금액만 매핑하고 status를 버린다. 배지엔 status가 필요하므로 `features/status/api/getInvoiceStatus.ts` 신규:
```ts
import type { Schemas } from '@carry/types';
import { ApiError } from '@carry/api';
import { createV2Client } from '@shared/api/v2-client';

export type InvoiceStatusInfo = {
  invoice: Pick<Schemas['InvoiceResponse'], 'status' | 'totalAmount'> | null;
  payment: Pick<Schemas['PaymentResponse'], 'status'> | null;
};

async function getOr404Null<T>(fn: () => Promise<T>): Promise<T | null> {
  try { return await fn(); } catch (e) { if (e instanceof ApiError && e.status === 404) return null; throw e; }
}

export async function getInvoiceStatus(accessToken: string, orderId: number): Promise<InvoiceStatusInfo> {
  const client = createV2Client({ accessToken });
  const [invoice, payment] = await Promise.all([
    getOr404Null(() => client.request<Schemas['InvoiceResponse']>(`/api/v2/payments/${orderId}/invoice`, { method: 'GET', cache: 'no-cache' })),
    getOr404Null(() => client.request<Schemas['PaymentResponse']>(`/api/v2/payments/${orderId}/payment`, { method: 'GET', cache: 'no-cache' })),
  ]);
  return {
    invoice: invoice ? { status: invoice.status, totalAmount: invoice.totalAmount } : null,
    payment: payment ? { status: payment.status } : null,
  };
}
```

- [ ] **Step 4: 목록 페이지**

`status/page.tsx`: `<StatusCard variant="list" orderStatus={order.status} info={order} hasButton />` — 결제 배지 없이 배송 진행만. 인보이스 조회 없음(N+1 회피).

- [ ] **Step 5: StatusCard 테스트** (`.test.tsx`)

- detail + PAID 배지 → "결제 완료" + 금액 렌더.
- detail + needsAction 배지 → "카드 확인 필요" 배너.
- list variant → 배지 미표시, 배송 진행만.
- CANCELLED orderStatus → "취소" 표시.

- [ ] **Step 6: 통과 + tsc + Commit**

Run: `pnpm --filter customer-web test StatusCard status` → PASS.
Run: `pnpm --filter customer-web exec tsc --noEmit` → 에러 없음.
```bash
git add apps/customer-web/src/features/status/ apps/customer-web/src/app/\(fullscreen\)/status/
git commit -m "feat: 상태 화면 2지표 — 배송 진행 + 결제 배지(상세만), totalAmount 실금액, 목록 N+1 회피"
```

---

## Chunk 3: 결제화면 영수증화 + 카드관리 + 연체 + e2e

### Task 9: 수동 결제창 제거 → 영수증

**Files:**
- Rewrite: `apps/customer-web/src/app/(fullscreen)/payment/[id]/page.tsx` (영수증 뷰)
- Delete: `apps/customer-web/src/app/(fullscreen)/payment/success/page.tsx`
- Modify: `apps/customer-web/src/features/payment/api/payment.ts` (postConfirmPayment 제거)
- Modify: `apps/customer-web/src/features/payment/index.ts`
- Modify: `apps/customer-web/src/features/payment/api/payment.test.ts` (confirm 테스트 제거)
- Modify: `apps/customer-web/package.json` (@tosspayments 제거)
- Keep: `features/payment/lib/constants.ts`의 `CARD_INSTITUTIONS`(등록 시트가 사용) — `PAYMENT_METHODS`/`INSTALLMENT_OPTIONS`는 제거

- [ ] **Step 1: 영수증 페이지 재작성**

`payment/[id]/page.tsx`에서 Toss SDK 로드·`generateCustomerKey`·`requestPayment`·결제수단 UI·`@tosspayments` import 전부 제거. `getPaymentInfo`(기존)로 항목별 비용·총액을 읽어 **읽기전용 영수증**으로 렌더(TopNavigation "영수증", 세탁비/배달비/수수료/총액/주문일). ⚠️ `PaymentInfo`엔 결제일(paid-at) 필드가 없고 `orderedAt`(=invoice.createdAt)만 있으므로 "주문일"로 표기(진짜 결제일 아님). 결제 버튼 없음.

- [ ] **Step 2: 삭제·정리**

`payment/success/page.tsx` 삭제. `payment.ts`에서 `postConfirmPayment` 삭제. `index.ts`에서 `postConfirmPayment`·`PAYMENT_METHODS`·`INSTALLMENT_OPTIONS` export 제거(`getPaymentInfo`, `PaymentInfo`, `CARD_INSTITUTIONS` 유지 — 등록 시트가 사용). `constants.ts`에서 `PAYMENT_METHODS`/`INSTALLMENT_OPTIONS`/`PaymentMethod` 제거. `package.json`에서 `@tosspayments/tosspayments-sdk` 제거(다른 사용처 없음 — 인벤토리 확인됨). `payment.test.ts`: `postConfirmPayment` 테스트(케이스4) 제거 **+ 상단 import를 `import { getPaymentInfo } from './payment'`로 트림**(제거된 심볼 import 잔존 시 TS 에러).

- [ ] **Step 3: 그래프 정리 확인**

`grep -rn "@tosspayments\|generateCustomerKey\|postConfirmPayment\|PAYMENT_METHODS\|INSTALLMENT_OPTIONS\|payment/success" apps/customer-web/src` → 잔여 없음(영수증 페이지 주석의 실 Toss 심 언급은 문자열이라 무방).

- [ ] **Step 4: 테스트 + tsc + 설치 + Commit**

Run: `pnpm install`(package.json 변경 반영).
Run: `pnpm --filter customer-web test payment` → PASS(축소된 케이스).
Run: `pnpm --filter customer-web exec tsc --noEmit` → 에러 없음.
```bash
git add apps/customer-web/ pnpm-lock.yaml
git commit -m "refactor!: 수동 Toss 결제창 제거 → /payment/[id] 영수증화, 결제수단 상수·SDK 정리"
```

### Task 10: 카드 관리(마이) + 진입

**Files:**
- Create: `apps/customer-web/src/features/billing/ui/MyCardSection.tsx`
- Create: `apps/customer-web/src/app/(app)/my/payment/page.tsx`
- Modify: `apps/customer-web/src/app/(app)/my/page.tsx` (member-info 섹션에 '결제수단' 진입 추가)
- Modify: `apps/customer-web/src/features/billing/index.ts`
- Test: `apps/customer-web/src/features/billing/ui/MyCardSection.test.tsx`

- [ ] **Step 1: MyCardSection 구현**

`useMyBillingKey()`로 등록 카드 표시(카드사·`•••• {cardLast4}`)와 "변경"(등록 시트 재오픈) 버튼. 카드 없으면 빈 상태 + "카드 등록" 버튼. 등록/변경 성공 시 훅 무효화로 자동 갱신.

- [ ] **Step 2: 라우트·진입**

`my/payment/page.tsx`가 `MyCardSection` 렌더. `my/page.tsx`의 `SETTINGS_SECTIONS` `member-info` items에 항목 추가 — ⚠️ `MenuItem` 인터페이스(`shared/ui/Menu/Menu.tsx`)는 `{ id, title, path, rightText? }` 형태다(`label/href` 아님). 정확히 `{ id: 'payment-method', title: '결제수단', path: '/my/payment' }`로 추가(기존 '배송지 관리'·'계정 설정' 옆).

- [ ] **Step 3: 테스트**

- 카드 있음 → "•••• 1234" 렌더 + "변경" 버튼.
- 카드 없음(404→null) → "카드 등록" 버튼.

- [ ] **Step 4: 통과 + tsc + Commit**

Run: `pnpm --filter customer-web test MyCardSection` → PASS.
```bash
git add apps/customer-web/src/features/billing/ apps/customer-web/src/app/\(app\)/my/
git commit -m "feat: 마이>결제수단 — 등록 카드 조회·변경 + 진입 메뉴"
```

### Task 11: 연체 해소 경로

**Files:**
- Create: `apps/customer-web/src/features/billing/ui/OverdueResolution.tsx`
- Create: `apps/customer-web/src/app/(app)/billing/overdue/page.tsx`
- Modify: `apps/customer-web/src/features/billing/index.ts`
- Test: `apps/customer-web/src/features/billing/ui/OverdueResolution.test.tsx`

- [ ] **Step 1: OverdueResolution 구현**

안내문("미납 결제가 있어 새 주문을 만들 수 없어요. 카드를 다시 등록하면 잠시 후 자동으로 재결제됩니다.") + 카드 재등록 버튼(등록 시트) → 성공 시 안내 전환("카드를 등록했어요. 미납분 재결제가 처리되면 다시 주문할 수 있어요.") + "홈으로/내 주문 보기". **특정 인보이스 폴링 없음**(스펙 §4.6) — 재등록만 담당, 해소는 백엔드 스위퍼가 수행.

- [ ] **Step 2: 라우트**

`billing/overdue/page.tsx`가 `OverdueResolution` 렌더. (Task 6의 409 OVERDUE 라우팅 타깃.)

- [ ] **Step 3: 테스트**

- 초기 안내문 렌더 + 재등록 버튼.
- 재등록 성공(등록 시트 mutation 성공 목) → 전환 안내문 렌더.

- [ ] **Step 4: 통과 + tsc + Commit**

Run: `pnpm --filter customer-web test OverdueResolution` → PASS.
```bash
git add apps/customer-web/src/features/billing/ apps/customer-web/src/app/\(app\)/billing/
git commit -m "feat: 연체 해소 화면 — 카드 재등록 후 안내(스위퍼가 자동 재결제)"
```

### Task 12: Playwright e2e 확장

**Files:**
- Modify: `e2e/specs/customer-ui.spec.ts` (또는 journey 스펙 — 실제 파일 구조 확인)
- Modify: `e2e/fixtures/` (빌링키 등록 헬퍼)

- [ ] **Step 1: 기존 e2e 구조 확인**

`e2e/`의 스펙·픽스처·`playwright.config.ts`를 읽어 프로젝트 구성을 파악: UI 저니는 `customer-ui` 프로젝트(Pixel 5, baseURL 있음), 백엔드 자동과금/스위퍼 구동은 API 레벨(`refund-journey`/`api` 패턴, baseURL 없이 `request` 컨텍스트). **신규 스펙은 UI 저니는 `customer-ui`에 두고, 자동과금은 그 안에서 `request` 컨텍스트로 백엔드를 구동**하는 혼합 구조로 작성(baseURL 없는 `api` 프로젝트에 UI 테스트를 넣지 말 것). `devLogin` 픽스처 재사용.

- [ ] **Step 2: 시나리오 확장**

- 로그인 → (카드 미등록) 주문 제출 → 등록 시트 노출 → 카드 등록(목) → 주문 생성 → `/status/{id}` → 배송 진행 표시.
- 백엔드 자동과금(기존처럼 API/스위퍼로 구동) → 상태 상세 재조회 → 결제 배지 "결제 완료".
- (선택) 실패 경로: 과금 실패 유도(백엔드 stub의 실패 마커) → 연체 배너 → 재등록.
정확한 API 구동 방식은 기존 `refund-journey`/`coordinator-ui` 스펙의 결제 구동 패턴을 따른다.

- [ ] **Step 3: e2e 실행**

Run: `pnpm --filter e2e test`(또는 레포의 e2e 스크립트). 백엔드·프론트 기동 필요 — 기존 e2e 실행 절차를 따른다. Docker/서비스 미기동으로 실행 불가하면 스펙 작성까지만 하고 BLOCKED로 보고(수동 실행 안내).

- [ ] **Step 4: Commit**

```bash
git add e2e/
git commit -m "test(e2e): 빌링키 등록→주문→자동과금 결제완료 저니, 목 등록으로 고객 결제 UI 최초 커버"
```

### Task 13: 최종 검증 + PR

- [ ] **Step 1: 전체 검증**

Run: `pnpm --filter customer-web exec tsc --noEmit` → 에러 없음.
Run: `pnpm --filter customer-web test` → 전체 통과(실행 수 확인, 신규 포함).
Run: `pnpm --filter customer-web lint`(eslint 있으면) → 통과.
Run: `pnpm --filter customer-web build`(next build) → 성공(라우트·타입 최종 확인).

- [ ] **Step 2: 잔여 정리 확인**

`grep -rn "PAYMENT_PENDING\|LaundryStatusType\|OrderDetailStatus\|generateCustomerKey\|@tosspayments" apps/customer-web/src` → 구 상태 어휘·Toss 잔재가 의도치 않게 남지 않았는지 확인(상태 union은 배송/결제 2지표로 이행 완료여야 함; 잔존 참조가 있으면 정리).

- [ ] **Step 3: Commit + PR**

```bash
git push -u origin feat/customer-web-billing-autocharge
gh pr create --base develop --title "feat: customer-web 빌링키 자동과금 정합 — 등록 인터셉·2지표·영수증·연체" --body-file <PR본문파일>
```
PR 본문: 스펙 링크, 백엔드 PR #157 참조, 변경 요약(등록 인터셉·상태 2지표·수동결제 제거·카드관리·연체), 테스트 근거(tsc·vitest·e2e). `Closes #<이슈>`(없으면 생성). 머지는 관례대로 `gh pr merge --merge --delete-branch`.
