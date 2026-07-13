// mock PG: 백엔드 스텁이 authKey 문자열을 그대로 수용하므로 임의 값을 만든다.
// 실 Toss 배선(주석 심): 등록 시 아래로 교체 — PG 콘솔 준비 시.
//   const tossPayments = await loadTossPayments(clientKey);
//   const { authKey } = await tossPayments.requestBillingAuth({ customerKey, ... });
export function createMockAuthKey(): string {
  return `mock-auth-${crypto.randomUUID()}`;
}
