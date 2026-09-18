'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  cancelOrder,
  canCancel,
  getOrder,
  orderStatusLabel,
  willRefundOnCancel,
  type Order,
} from '@features/order';

/**
 * 주문 상세 — 운영 정보 확인 + 취소(결제 완료 주문은 환불 보상 사가 시작).
 */
export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const orderId = Number(params.id);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setOrder(await getOrder(orderId));
    } catch {
      setError('주문을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCancel() {
    if (!order) return;
    const reason = window.prompt('취소 사유를 입력하세요');
    if (!reason) return;
    setSubmitting(true);
    setNotice(null);
    try {
      await cancelOrder(orderId, reason);
      setNotice(
        willRefundOnCancel(order.status)
          ? '주문을 취소했습니다. 환불 보상이 진행됩니다.'
          : '주문을 취소했습니다.',
      );
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
        <h1 className="text-lg font-bold">주문 #{orderId}</h1>
        <Link href="/orders" className="text-sm text-gray-500 underline">
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
      ) : order ? (
        <>
          <dl className="rounded-lg border border-gray-200 p-4 text-sm">
            <Row label="상태" value={orderStatusLabel(order.status)} />
            <Row label="고객" value={`#${order.customerId}`} />
            <Row label="세탁소" value={`#${order.laundromatId}`} />
            <Row label="품목" value={order.laundryItemType} />
            {/* 총액은 청구서(Invoice) 소관이라 OrderResponse 에 없다(결제·물리 흐름 분리).
                코디네이터용 인보이스 조회 API 가 생기면 여기에 붙인다. */}
            {order.carrierId != null && <Row label="배달원" value={`#${order.carrierId}`} />}
            {order.cancelReason && <Row label="취소 사유" value={order.cancelReason} />}
          </dl>

          {canCancel(order.status) && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={submitting}
              className="rounded-lg bg-red-600 px-4 py-3 font-semibold text-white disabled:opacity-50"
            >
              {submitting
                ? '취소 중…'
                : willRefundOnCancel(order.status)
                  ? '주문 취소 (환불 보상)'
                  : '주문 취소'}
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
