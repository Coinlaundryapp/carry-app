'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { deliveryStatusLabel, getMyDeliveries, type Delivery } from '@features/delivery';

export default function DeliveriesPage() {
  const [items, setItems] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMyDeliveries()
      .then(setItems)
      .catch(() => setError('배달 목록을 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 px-4 py-6">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-bold">내 배달</h1>
        <Link href="/" className="text-sm text-gray-500 underline">
          홈
        </Link>
      </header>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-400">불러오는 중…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-400">진행 중인 배달이 없습니다.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((d) => (
            <li key={d.id} className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold">주문 #{d.orderId}</span>
                <span className="text-xs text-gray-500">{deliveryStatusLabel(d.status)}</span>
              </div>
              <div className="mt-3">
                <Link
                  href={`/deliveries/${d.id}`}
                  className="text-sm font-semibold text-blue-600 underline"
                >
                  진행하기
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
