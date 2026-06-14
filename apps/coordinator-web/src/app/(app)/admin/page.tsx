'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRole } from '@features/auth';
import {
  getRecentEvents,
  getSummary,
  type OperationEvent,
  type OperationSummary,
} from '@features/operation';

/**
 * ADMIN 전용 운영 대시보드 — coordinator-web에 role 가드로 통합(별도 ADMIN 앱 없음).
 * COORDINATOR 등 비-ADMIN은 홈으로 돌려보낸다.
 */
export default function AdminDashboardPage() {
  const router = useRouter();
  const { isAdmin, loading: roleLoading } = useRole();

  const [summary, setSummary] = useState<OperationSummary | null>(null);
  const [events, setEvents] = useState<OperationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 비-ADMIN 가드 — 역할 확인 후 권한 없으면 홈으로.
  useEffect(() => {
    if (!roleLoading && !isAdmin) router.replace('/');
  }, [roleLoading, isAdmin, router]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, e] = await Promise.all([getSummary(), getRecentEvents(20)]);
      setSummary(s);
      setEvents(e);
    } catch {
      setError('대시보드를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) void load();
  }, [isAdmin, load]);

  if (roleLoading || !isAdmin) return null;

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 px-4 py-6">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-bold">운영 대시보드 (ADMIN)</h1>
        <Link href="/" className="text-sm text-gray-500 underline">
          홈
        </Link>
      </header>

      {error && (
        <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">불러오는 중…</p>
      ) : (
        <>
          {summary && (
            <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Stat label="오늘 주문" value={summary.totalOrdersToday} />
              <Stat label="대기 배차" value={summary.pendingDispatches} />
              <Stat label="진행 배달" value={summary.activeDeliveries} />
              <Stat label="오늘 완료" value={summary.completedToday} />
              <Stat label="오늘 취소" value={summary.cancelledToday} />
            </section>
          )}

          <section>
            <h2 className="mb-2 text-sm font-semibold">최근 운영 이벤트</h2>
            {events.length === 0 ? (
              <p className="text-sm text-gray-400">이벤트가 없습니다.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {events.map((e) => (
                  <li key={e.id} className="rounded border border-gray-100 px-3 py-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">{e.eventType}</span>
                      <span className="text-xs text-gray-400">
                        {e.aggregateType} #{e.aggregateId}
                      </span>
                    </div>
                    <p className="mt-0.5 text-gray-500">{e.summary}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
