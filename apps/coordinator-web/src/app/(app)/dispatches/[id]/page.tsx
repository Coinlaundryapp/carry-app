'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  assignDispatch,
  canAssign,
  canCancel,
  cancelDispatch,
  dispatchStatusLabel,
  getCarriersByArea,
  getDispatch,
  type CarrierArea,
  type Dispatch,
} from '@features/dispatch';

/**
 * 배차 상세 — 미배정 배차를 권역 배달원에게 배정하거나 취소한다.
 */
export default function DispatchDetailPage({ params }: { params: { id: string } }) {
  const dispatchId = Number(params.id);

  const [dispatch, setDispatch] = useState<Dispatch | null>(null);
  const [carriers, setCarriers] = useState<CarrierArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await getDispatch(dispatchId);
      setDispatch(d);
      if (canAssign(d.status)) {
        setCarriers(await getCarriersByArea(d.areaCode));
      }
    } catch {
      setError('배차를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [dispatchId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleAssign(carrierId: number) {
    setSubmitting(true);
    setNotice(null);
    try {
      await assignDispatch(dispatchId, carrierId);
      setNotice(`배달원 #${carrierId}에게 배정했습니다.`);
      await load();
    } catch {
      setNotice('배정에 실패했습니다. 상태를 확인해 주세요.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel() {
    const reason = window.prompt('취소 사유를 입력하세요');
    if (!reason) return;
    setSubmitting(true);
    setNotice(null);
    try {
      await cancelDispatch(dispatchId, reason);
      setNotice('배차를 취소했습니다.');
      await load();
    } catch {
      setNotice('취소에 실패했습니다. 상태를 확인해 주세요.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-4 px-4 py-6">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-bold">배차 #{dispatchId}</h1>
        <Link href="/dispatches" className="text-sm text-gray-500 underline">
          목록
        </Link>
      </header>

      {error && (
        <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="rounded bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {notice}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">불러오는 중…</p>
      ) : dispatch ? (
        <>
          <dl className="rounded-lg border border-gray-200 p-4 text-sm">
            <Row label="상태" value={dispatchStatusLabel(dispatch.status)} />
            <Row label="주문" value={`#${dispatch.orderId}`} />
            <Row label="세탁소" value={`#${dispatch.laundromatId}`} />
            <Row label="권역" value={dispatch.areaCode} />
            {dispatch.carrierId != null && <Row label="배달원" value={`#${dispatch.carrierId}`} />}
            {dispatch.cancelReason && <Row label="취소 사유" value={dispatch.cancelReason} />}
          </dl>

          {canAssign(dispatch.status) && (
            <section className="rounded-lg border border-gray-200 p-4">
              <h2 className="mb-2 text-sm font-semibold">권역 배달원 배정</h2>
              {carriers.length === 0 ? (
                <p className="text-sm text-gray-400">해당 권역에 배달원이 없습니다.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {carriers.map((c) => (
                    <li key={c.id} className="flex items-center justify-between">
                      <span className="text-sm">
                        배달원 #{c.carrierId}
                        {!c.active && ' (비활성)'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAssign(c.carrierId)}
                        disabled={submitting}
                        className="rounded bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        배정
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {canCancel(dispatch.status) && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={submitting}
              className="rounded-lg bg-red-600 px-4 py-3 font-semibold text-white disabled:opacity-50"
            >
              배차 취소
            </button>
          )}
        </>
      ) : null}
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-gray-100 py-2 last:border-0">
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
