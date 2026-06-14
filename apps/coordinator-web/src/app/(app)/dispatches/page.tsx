'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { getDispatches, dispatchStatusLabel, type Dispatch } from '@features/dispatch';

const STATUS_FILTERS = ['PENDING', 'ASSIGNED', 'ACCEPTED', 'CANCELLED'] as const;

/**
 * 배차 조율 목록 — 상태 필터로 거른 전체 배차(코디네이터). 미배정 배차를 상세에서 배정한다.
 */
export default function DispatchesPage() {
  const [status, setStatus] = useState<string>('PENDING');
  const [items, setItems] = useState<Dispatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (s: string) => {
    setLoading(true);
    setError(null);
    try {
      setItems(await getDispatches(s || undefined));
    } catch {
      setError('배차 목록을 불러오지 못했습니다.');
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
        <h1 className="text-lg font-bold">배차 조율</h1>
        <Link href="/" className="text-sm text-gray-500 underline">
          홈
        </Link>
      </header>

      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="상태 필터">
        <FilterChip active={status === ''} onClick={() => setStatus('')}>
          전체
        </FilterChip>
        {STATUS_FILTERS.map((s) => (
          <FilterChip key={s} active={status === s} onClick={() => setStatus(s)}>
            {dispatchStatusLabel(s)}
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
        <p className="text-sm text-gray-400">배차가 없습니다.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((d) => (
            <li key={d.id}>
              <Link
                href={`/dispatches/${d.id}`}
                className="block rounded-lg border border-gray-200 p-4 transition hover:border-blue-400 hover:bg-blue-50"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">주문 #{d.orderId}</span>
                  <span className="text-xs text-gray-500">{dispatchStatusLabel(d.status)}</span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  권역 {d.areaCode}
                  {d.carrierId != null && ` · 배달원 #${d.carrierId}`}
                </p>
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
