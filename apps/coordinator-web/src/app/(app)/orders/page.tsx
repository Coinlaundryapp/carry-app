'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { getOrders, orderStatusLabel, ORDER_STATUS_FILTERS, type Order } from '@features/order';

/**
 * 주문 운영 목록 — 상태 필터로 거른 전체 주문(코디네이터). 상세에서 취소·환불을 진행한다.
 */
export default function OrdersPage() {
  // 기본값은 '전체'. 예전 기본값이던 'PAID' 는 결제·물리 흐름 분리로 사라진 상태라
  // 목록이 항상 빈 화면으로 열렸다. 코디네이터는 진행 중·종결을 모두 훑어야 하므로 전체가 기본이다.
  const [status, setStatus] = useState<string>('');
  const [items, setItems] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (s: string) => {
    setLoading(true);
    setError(null);
    try {
      setItems(await getOrders(s || undefined));
    } catch {
      setError('주문 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(status);
  }, [status, load]);

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 px-4 py-6">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-bold">주문 운영</h1>
        <Link href="/" className="text-sm text-gray-500 underline">
          홈
        </Link>
      </header>

      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="상태 필터">
        <FilterChip active={status === ''} onClick={() => setStatus('')}>
          전체
        </FilterChip>
        {ORDER_STATUS_FILTERS.map((s) => (
          <FilterChip key={s} active={status === s} onClick={() => setStatus(s)}>
            {orderStatusLabel(s)}
          </FilterChip>
        ))}
      </div>

      {error && (
        <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">불러오는 중…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-400">주문이 없습니다.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((o) => (
            <li key={o.id}>
              <Link
                href={`/orders/${o.id}`}
                className="block rounded-lg border border-gray-200 p-4 transition hover:border-blue-400 hover:bg-blue-50"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">주문 #{o.id}</span>
                  <span className="text-xs text-gray-500">{orderStatusLabel(o.status)}</span>
                </div>
                {/* 금액은 주문이 아니라 청구서(Invoice)의 것이다 — 결제·물리 흐름 분리 이후
                    OrderResponse 에 totalAmount 가 없다. 코디네이터가 볼 수 있는 인보이스 조회
                    API 도 아직 없어(고객 소유권 검증) 목록에서는 금액을 보여주지 않는다. */}
                <p className="mt-1 text-sm text-gray-500">고객 #{o.customerId}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm font-medium ${
        active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
      }`}
    >
      {children}
    </button>
  );
}
