# customer-web 빌링키 자동과금 정합 — 설계

> 작성일: 2026-07-13
> 상태: 설계 승인 (구현 전)
> 범위: carry-app `apps/customer-web` 프론트만 (carrier/coordinator·실 Toss·그룹 세탁 제외)
> 대응 백엔드: carry-platform PR #157 (빌링키 자동과금, 결제·물리 흐름 완전 분리)

---

## 1. 배경

백엔드가 결제를 주문 물리 흐름에서 분리했다(PR #157). 결과:
- **주문 상태**가 물리 사실 6종으로 축소: `CREATED / DISPATCHED / PICKED_UP / IN_PROGRESS / COMPLETED / CANCELLED`. 결제 상태(INVOICED/PAID/PAYMENT_FAILED/REFUND_PENDING/REFUNDED)는 제거되고 Invoice/Payment 모듈로 이관.
- **결제 모델**이 수동 위젯 결제(Toss 결제창) → **빌링키 자동과금**으로 전환. 주문 생성 시 활성 빌링키 필수(`BILLING_KEY_REQUIRED` 409), 연체 고객 차단(`OVERDUE_INVOICE_EXISTS` 409). 수거 후 자동과금, 실패는 백엔드 스위퍼가 재시도.
- 수동 결제 API(`POST /api/v2/payments/pay`), 배달 완료 결제 게이트(`ORDER_NOT_PAID`)는 삭제. 신규 `POST/GET /api/v2/billing-keys`.

customer-web은 아직 구 모델이다: `/payment/[id]`에서 인보이스 발행 후 수동 Toss 결제창(`payment.requestPayment`), `postConfirmPayment`는 목, `generateCustomerKey`는 클라이언트 스텁, 빌링키/카드 관리 UI는 전무. 앱의 상태 어휘는 결제 중심 8종(`PAYMENT_PENDING/PAYMENT_COMPLETED/...`)으로 새 물리-6상태와 불일치.

## 2. 목표와 원칙

customer-web을 새 백엔드 계약에 맞춘다. 핵심 UX 원칙(백엔드와 동일): **주문 생성 시점에 지불수단을 확보하되, 이후 물리 흐름은 결제를 기다리지 않는다.** 기존 strangler/anti-corruption 패턴(생성 타입 → 앱 타입 매퍼) 유지. mock PG 정합(실 Toss는 주석 심).

## 3. 아키텍처 개요

기존 스택 유지: Next.js 14 App Router, React Query 5 + Zustand 4, Tailwind + CVA, NextAuth v5, `@carry/api`(fetch 래퍼) + `@carry/types`(openapi 생성). 변경은 6개 축으로 나뉘며 각각 독립 단위다:

1. 타입 동기화 + anti-corruption 매퍼
2. 신규 `features/billing` (등록·조회·변경)
3. 주문 제출 인터셉 (`features/order`)
4. 상태 화면 2지표 재편 (`features/status`)
5. 수동 결제 화면 → 영수증 용도변경 (`features/payment`)
6. 연체 해소 경로

## 4. 컴포넌트 설계

### 4.1 타입 동기화 + 매퍼

- `pnpm gen:types` 재실행: `../carry-platform/docs/api/openapi-v2.json` → `packages/types/src/generated/v2.ts`. 새 스키마(`BillingKeyResponse`, `/api/v2/billing-keys` 경로, `OrderResponse`에서 `totalAmount` 제거)가 반영된다.
- ⚠️ **상태 필드는 openapi에서 enum이 아니라 `type: string`이다** (`OrderResponse.status`, `InvoiceResponse.status`, `PaymentResponse.status` 모두). `gen:types`는 리터럴 union이 아닌 `status: string`을 낸다. 따라서 앱이 의존하는 상태 리터럴(주문 물리 6종, Invoice `ISSUED/PAID/OVERDUE/CANCELLED/REFUNDED`, Payment `PENDING/COMPLETED/FAILED/REFUND_PENDING/REFUNDED`)은 **앱 상수로 직접 정의**한다(`features/status/lib/status-constants.ts` 등). 값은 백엔드 enum(`OrderEnums.kt`/`PaymentEnums.kt`)과 대조해 확정한다. 매퍼는 이 문자열을 방어적으로(모르는 값 → 안전 기본) 처리한다.
- 앱 측 anti-corruption 매퍼(기존 `to*` 함수 옆, 각 feature `api/*.ts` 내 모듈 private 관례):
  - `toBillingKey(res)` — 생성 `BillingKeyResponse` → 앱 `BillingKey{cardCompany, cardLast4, registeredAt}`.
  - `toDeliveryProgress(orderStatus: string)` — 주문 6상태 → 친화 단계(§4.4).
  - `toPaymentStatus(invoice, payment)` — invoice/payment 상태 문자열 → 결제 배지 모델(§4.4).
- 죽은 계약 정리: `postConfirmPayment` 목(§4.5에서 제거), `PaymentRequest` 사용처, `generateCustomerKey` 스텁.
- **`totalAmount` 제거 파급**: `getOrderDetail.ts`의 `toOrderDetail`이 `order.totalAmount ?? 0`을 읽는데, 재생성 후 `OrderResponse`에 `totalAmount`가 없어 TS 에러가 난다. 이 매퍼를 리워크 범위에 포함해 금액을 인보이스 조회로 이관(§4.4)한다.
- 앱 상태 어휘 재편: 구 `OrderDetailStatus`/`LaundryStatusType`(8종)을 `DeliveryProgress`(물리 단계) + `PaymentBadge`(결제) 두 축으로 대체. 구 union을 참조하던 모든 지점을 이행한다.

### 4.2 신규 `features/billing`

- `api/billing.ts`
  - `registerBillingKey(authKey: string): Promise<BillingKey>` → `POST /api/v2/billing-keys` (body `{authKey}`, Idempotency-Key). 응답 `{cardCompany, cardLast4, registeredAt}`.
  - `getMyBillingKey(): Promise<BillingKey | null>` → `GET /api/v2/billing-keys/me`; 404 → `null`(카드 없음).
- `lib/mock-auth-key.ts` — `createMockAuthKey()` 목 authKey 생성. **실 Toss 배선은 주석 심**: `// 실 Toss: const { authKey } = await tossPayments.requestBillingAuth({ customerKey }) — PG 콘솔 준비 시 배선` (기존 `postConfirmPayment` 목-with-주석 패턴 준용).
- `ui/BillingKeyRegistrationSheet.tsx` — `vaul` 드로어. 카드사 선택(`CARD_INSTITUTIONS` 재사용) + 번호 입력(목, 형식 검증만) → `createMockAuthKey()` → `useRegisterBillingKey` → 성공 시 마스킹 카드 표시 후 `onSuccess` 콜백. 실패 시 토스트.
- `ui/MyCardSection.tsx` — 마이>결제수단. `useMyBillingKey`로 등록 카드 표시(카드사·끝4자리) + "변경"(재등록 시트) + 빈 상태 "카드 등록". `app/(app)/my/setting/page.tsx` 또는 신규 `my/payment` 라우트에 배치.
- 훅: `model/useMyBillingKey.ts`(`useQuery`), `model/useRegisterBillingKey.ts`(`useMutation`, 성공 시 `useMyBillingKey`·연체 관련 쿼리 무효화).

### 4.3 주문 제출 인터셉 (`features/order`)

**선행 수정 (필수)**: 현재 `order.ts`의 `postOrder`는 `catch (error) { throw new Error('주문에 실패했습니다.') }`로 **에러 코드를 삼킨다**. 인터셉 분기가 불가능하므로, 이 catch를 제거해 `@carry/api`가 던지는 `ApiError`(필드 `.code`, `packages/api/src/errors.ts`)를 그대로 전파하도록 고친다.

`ui/OrderSubmitDrawer.tsx` 확정 핸들러:
1. `useMyBillingKey()` 확인. 키 없으면 `BillingKeyRegistrationSheet` 오픈 → 성공 콜백에서 이어서 제출. 키 있으면 바로 제출(원탭).
2. `postOrder(...)` 호출. `catch (error)` 에서 `error instanceof ApiError`이면 `error.code` 분기:
   - `BILLING_KEY_REQUIRED` — 조회-제출 사이 레이스 폴백: 등록 시트 오픈.
   - `OVERDUE_INVOICE_EXISTS` — 연체 해소 화면으로 라우팅(§4.6).
   - 그 외 — 기존 토스트.
3. 성공 → `reset()` → `/status/{id}`.

백엔드 코드 문자열(`BILLING_KEY_REQUIRED`/`OVERDUE_INVOICE_EXISTS`)을 앱 상수로 정의(`features/order/lib/error-codes.ts`)해 매핑한다.

### 4.4 상태 화면 2지표 (`features/status`)

`ui/StatusCard.tsx` + `app/(fullscreen)/status/[id]/page.tsx` 재편:

- **배송 진행 트랙** (`toDeliveryProgress`):
  | 주문 상태 | 친화 단계 |
  |---|---|
  | CREATED, DISPATCHED | 수거 대기 |
  | PICKED_UP | 수거 완료 |
  | IN_PROGRESS | 세탁·배송중 |
  | COMPLETED | 완료 |
  | CANCELLED | 취소 |

  4단계 진행 인디케이터(취소는 별도 종결 표시).
- **결제 배지** (`toPaymentStatus`): 인보이스/결제 조회(`GET /api/v2/payments/{orderId}/invoice`, `/payment`) →
  | 조건 | 배지 |
  |---|---|
  | 인보이스 없음(수거 전, 404) | 표시 안 함 |
  | Payment COMPLETED / Invoice PAID | 결제 완료 + `invoice.totalAmount` |
  | Payment PENDING, Invoice ISSUED | 결제 처리중 |
  | Payment FAILED, Invoice ISSUED | 결제 실패 |
  | Invoice OVERDUE | 연체 |
  | Payment REFUND_PENDING / Invoice(취소 후 환불 진행) | 환불 처리중 |
  | Payment REFUNDED / Invoice REFUNDED | 환불 완료 |
  | Invoice CANCELLED (미과금 취소) | 배지 없음 |
  - 모르는 상태 조합은 안전 기본(배지 숨김).
  - 현재 `{}원` 스텁을 실 `invoice.totalAmount`로 교체.
- **취소 주문 표시**: 주문 CANCELLED이면 배송 트랙은 "취소"로 종결. 결제 배지는 위 표대로(수거 전 취소 → 인보이스 없음 → 배지 없음; 과금 후 취소 → 환불 처리중/완료).
- **실패/연체 배너**: 결제 실패·연체 시 "결제 수단에 문제가 있어요 · 카드 확인 필요" + CTA → 카드 변경(§4.2)/연체 해소(§4.6). 환불 처리중/완료는 정보성 표시(배너 아님).
- **상세 화면**: 인보이스 조회는 주문 상세와 병렬 `useQuery`; 인보이스 404(수거 전)는 결제 지표 숨김.
- **목록 화면 N+1 회피**: `StatusCard`는 상세(`status/[id]`)와 목록(`status/page.tsx`, N개 매핑) 양쪽에서 쓰인다. `GET /api/v2/orders/my`의 `OrderResponse`에는 결제/인보이스 상태 필드가 없으므로, **목록에서는 결제 배지를 항상 생략**하고 배송 진행 트랙만 표시한다(주문별 인보이스 조회 금지). 인보이스 병렬 조회는 상세 화면 전용. `StatusCard`에 `variant: 'list' | 'detail'` prop으로 분기.

### 4.5 수동 결제 화면 → 영수증 (`features/payment`)

**제거**: `app/(fullscreen)/payment/[id]/page.tsx`의 Toss SDK 로드·`payment.requestPayment`·결제수단 선택 UI·`generateCustomerKey`; `payment/success/page.tsx`·confirm 경로; `features/payment/api/payment.ts`의 `postConfirmPayment` 목; `PAYMENT_METHODS`/`INSTALLMENT_OPTIONS` 등 결제창 전용 상수(카드사 목록 `CARD_INSTITUTIONS`는 등록 시트에서 재사용하므로 유지).

**용도변경**: `/payment/[id]` → 읽기전용 영수증. `getPaymentInfo`(기존, `GET invoice`) 재사용해 항목별 비용(세탁비·배달비·수수료)·총액·결제일 표시. 상태 화면에서 "영수증 보기" 링크로 진입. `PaymentInfo` 매퍼(`toPaymentInfo`)는 유지.

### 4.6 연체 해소 경로

**제약**: openapi에 "내 연체 인보이스" 전용 엔드포인트가 없고, createOrder의 `OVERDUE_INVOICE_EXISTS`는 고객 전역 차단이라 어느 인보이스인지 특정하지 못한다. 백엔드 `ChargeRetrySweeper`는 주기 실행이라 재등록 직후 즉시 해소되지 않는다(재과금까지 지연). 따라서 프론트는 **특정 인보이스를 폴링하지 않고**, 해소 신호를 두 갈래로 정의한다:

- **연체 해소 화면** (신규 `features/billing/ui/OverdueResolution.tsx`, 주문 제출 409 OVERDUE 진입): "미납 결제가 있어 새 주문을 만들 수 없어요. 카드를 다시 등록하면 잠시 후 자동으로 재결제됩니다." → 카드 재등록 시트 → 성공 후 안내("카드를 등록했어요. 미납분 재결제가 처리되면 다시 주문할 수 있어요."). **재시도 신호 = createOrder 재시도의 409 소멸** — 사용자가 이후 주문을 다시 시도하면, 스위퍼가 이미 재과금해 OVERDUE가 PAID로 바뀐 경우 정상 진행되고, 아직이면 같은 안내를 반복한다. 프론트는 백엔드 재과금 타이밍을 알 수 없으므로 "즉시 해소"를 약속하지 않는다.
- **상태 화면 연체 배너** (특정 주문 문맥): 그 주문의 인보이스를 이미 조회 중이므로 대상이 명확하다. 재등록 후 그 주문 인보이스를 React Query로 재조회(무효화 + 화면 포커스 시 refetch)해 OVERDUE→PAID 전환을 자연 반영한다. 별도 폴링 루프는 두지 않는다(포커스 기반 refetch로 충분).

백엔드 `ChargeRetrySweeper`가 실제 재과금을 수행하므로 프론트 책임은 재등록 + 결과 재조회뿐이다.

## 5. 데이터 흐름 요약

- 등록: 시트 → `createMockAuthKey()` → `POST /billing-keys` → `useMyBillingKey`·연체 쿼리 무효화.
- 주문: 제출 → 키 확인(없으면 등록) → `postOrder` → `/status/{id}`.
- 상태: 주문상세(물리 상태) ∥ 인보이스(결제 상태·금액) → 배송 트랙 + 결제 배지.
- 실패/연체: 인보이스 FAILED/OVERDUE → 배너 → 카드 변경/재등록 → 스위퍼 회복 → 재조회.

## 6. 에러 처리

에러 판별은 `error instanceof ApiError` 후 `error.code`(백엔드 envelope `ApiResponse.code` — 평면 구조 `{status, code, message, data, traceId}`, 중첩 `.error` 없음). 코드 문자열은 백엔드 `ErrorCode.kt`에 존재함이 확인됨(`BILLING_KEY_REQUIRED`·`OVERDUE_INVOICE_EXISTS`·`BILLING_KEY_ISSUE_FAILED`·`BILLING_KEY_NOT_FOUND`).

| 상황 | 처리 |
|---|---|
| createOrder 409 BILLING_KEY_REQUIRED | 등록 시트(조회-제출 레이스 폴백) |
| createOrder 409 OVERDUE_INVOICE_EXISTS | 연체 해소 화면 |
| registerBillingKey 400 BILLING_KEY_ISSUE_FAILED | 토스트 + 재시도 |
| getMyBillingKey 404 BILLING_KEY_NOT_FOUND | 카드 없음(등록 유도) |
| 인보이스 404 (수거 전) | 결제 지표 숨김 |

## 7. 테스트

- **Vitest + MSW**: `billing/api`(register/getMy, 404→null), 매퍼(`toDeliveryProgress`, `toPaymentStatus` 조합표 — COMPLETED+FAILED 같은 경계 포함), 제출 인터셉 분기(키 유무·409 라우팅), 등록 성공/실패, 영수증 매핑. 기존 `postConfirmPayment` 목 테스트는 제거.
- **Playwright e2e**: `customer-ui`/journey 확장 — 목 카드 등록 → 주문 → (기존처럼 API/스위퍼로 과금 구동) → 상태 결제 완료 배지 확인; 실패 경로 → 연체 배너 → 재등록 → 회복. 목 등록 덕에 그간 실 Toss로 막혔던 고객 결제 흐름을 처음으로 e2e로 검증한다. 백엔드 stub PG와 정합.

## 8. 의도적 제외

- 실 Toss `requestBillingAuth` 연동(주석 심만).
- carrier-web / coordinator-web (별도 앱).
- 그룹 세탁(알뜰/팀) 관련 UI — 단독(SOLO) 전용.
- 실 결제 라이브 검증(PG 콘솔 보류).
