'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  acceptDispatch,
  canRespond,
  dispatchStatusLabel,
  getDispatch,
  rejectDispatch,
  type Dispatch,
} from '@features/dispatch';

export default function DispatchDetailPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const router = useRouter();
  const [dispatch, setDispatch] = useState<Dispatch | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setDispatch(await getDispatch(id));
    } catch {
      setNotice('배차를 불러오지 못했습니다.');
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleAccept() {
    setBusy(true);
    setNotice(null);
    try {
      await acceptDispatch(id);
      setNotice('배차를 수락했습니다. 배달이 생성됩니다.');
      await load();
    } catch {
      setNotice('수락에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  }

  async function handleReject() {
    setBusy(true);
    setNotice(null);
    try {
      await rejectDispatch(id);
      router.replace('/dispatches');
    } catch {
      setNotice('거절에 실패했습니다.');
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 px-4 py-6">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-bold">배차 상세</h1>
        <Link href="/dispatches" className="text-sm text-gray-500 underline">
          목록
        </Link>
      </header>

      {notice && (
        <p role="status" className="rounded bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {notice}
        </p>
      )}

      {dispatch && (
        <section className="flex flex-col gap-2 rounded-lg border border-gray-200 p-4">
          <Row label="주문" value={`#${dispatch.orderId}`} />
          <Row label="세탁소" value={`#${dispatch.laundromatId}`} />
          <Row label="권역" value={dispatch.areaCode} />
          <Row label="상태" value={dispatchStatusLabel(dispatch.status)} />
        </section>
      )}

      {dispatch && canRespond(dispatch.status) && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleAccept}
            disabled={busy}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white disabled:opacity-50"
          >
            수락
          </button>
          <button
            type="button"
            onClick={handleReject}
            disabled={busy}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-semibold text-gray-700 disabled:opacity-50"
          >
            거절
          </button>
        </div>
      )}
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
