'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ApiError } from '@carry/api';
import {
  claimDispatch,
  dispatchStatusLabel,
  getAvailableDispatches,
  getMyDispatches,
  type Dispatch,
} from '@features/dispatch';

type Tab = 'available' | 'my';

export default function DispatchesPage() {
  const [tab, setTab] = useState<Tab>('available');
  const [items, setItems] = useState<Dispatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async (t: Tab) => {
    setLoading(true);
    try {
      const data = t === 'available' ? await getAvailableDispatches() : await getMyDispatches();
      setItems(data);
    } catch {
      setNotice('목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(tab);
  }, [tab, load]);

  async function handleClaim(id: number) {
    setNotice(null);
    try {
      await claimDispatch(id);
      // self-claim은 PENDING→ACCEPTED로 바로 전이하고 배달이 생성된다(별도 수락 단계 없음).
      setNotice('배차를 수락했습니다. ‘내 배달’에서 진행하세요.');
      await load('available');
    } catch (e) {
      // 409 = 경합(다른 배달원이 먼저 선점). 목록을 새로고침해 최신 상태를 보여준다.
      if (e instanceof ApiError && e.status === 409) {
        setNotice('이미 다른 배달원이 선점했습니다. 목록을 새로고침했습니다.');
        await load('available');
      } else {
        setNotice('선점에 실패했습니다. 다시 시도해 주세요.');
      }
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 px-4 py-6">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-bold">배차</h1>
        <Link href="/" className="text-sm text-gray-500 underline">
          홈
        </Link>
      </header>

      <div className="flex gap-2" role="tablist">
        <TabButton active={tab === 'available'} onClick={() => setTab('available')}>
          수락 대기
        </TabButton>
        <TabButton active={tab === 'my'} onClick={() => setTab('my')}>
          내 배차
        </TabButton>
      </div>

      {notice && (
        <p role="status" className="rounded bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {notice}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">불러오는 중…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-400">배차가 없습니다.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((d) => (
            <li key={d.id} className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold">주문 #{d.orderId}</span>
                <span className="text-xs text-gray-500">{dispatchStatusLabel(d.status)}</span>
              </div>
              <p className="mt-1 text-sm text-gray-500">권역 {d.areaCode}</p>
              <div className="mt-3">
                {tab === 'available' ? (
                  <button
                    type="button"
                    onClick={() => handleClaim(d.id)}
                    className="rounded bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white"
                  >
                    선점
                  </button>
                ) : (
                  <Link
                    href={`/dispatches/${d.id}`}
                    className="text-sm font-semibold text-blue-600 underline"
                  >
                    상세 보기
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function TabButton({
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
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${
        active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
      }`}
    >
      {children}
    </button>
  );
}
