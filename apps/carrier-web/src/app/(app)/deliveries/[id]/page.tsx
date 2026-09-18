'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  completeDelivery,
  completeDrying,
  completePickup,
  deliveryStatusLabel,
  getDelivery,
  nextAction,
  startWashing,
  type Delivery,
} from '@features/delivery';
import { PhotoUploader } from '@features/media';

/**
 * 배달 상태기계 드라이버 — 현재 status가 다음 액션(수거/세탁/건조/배달)을 결정하고,
 * 각 액션은 증빙 사진(+수거는 무게)을 받아 전이를 호출한다.
 */
export default function DeliveryDetailPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [photoIds, setPhotoIds] = useState<number[]>([]);
  const [weight, setWeight] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setDelivery(await getDelivery(id));
      setPhotoIds([]);
      setWeight('');
    } catch {
      setNotice('배달을 불러오지 못했습니다.');
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const action = delivery ? nextAction(delivery.status) : null;
  const canSubmit =
    !!action && photoIds.length > 0 && (!action.needsWeight || Number(weight) > 0) && !busy;

  async function handleSubmit() {
    if (!action) return;
    setBusy(true);
    setNotice(null);
    try {
      switch (action.kind) {
        case 'pickup':
          await completePickup(id, { weight: Number(weight), photoIds });
          break;
        case 'washing':
          await startWashing(id, photoIds);
          break;
        case 'drying':
          await completeDrying(id, photoIds);
          break;
        case 'delivery':
          await completeDelivery(id, photoIds);
          break;
      }
      await load();
    } catch {
      setNotice('처리에 실패했습니다. 입력을 확인해 주세요.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 px-4 py-6">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-bold">배달 진행</h1>
        <Link href="/deliveries" className="text-sm text-gray-500 underline">
          목록
        </Link>
      </header>

      {notice && (
        <p role="status" className="rounded bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {notice}
        </p>
      )}

      {delivery && (
        <section className="flex flex-col gap-2 rounded-lg border border-gray-200 p-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">주문</span>
            <span className="font-medium">#{delivery.orderId}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">상태</span>
            <span className="font-medium">{deliveryStatusLabel(delivery.status)}</span>
          </div>
          {delivery.actualWeight != null && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">무게</span>
              <span className="font-medium">{delivery.actualWeight}kg</span>
            </div>
          )}
        </section>
      )}

      {action ? (
        <section className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4">
          <h2 className="font-semibold">{action.label}</h2>

          {action.needsWeight && (
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-gray-500">세탁물 무게(kg)</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                min="0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                aria-label="세탁물 무게(kg)"
                className="rounded border border-gray-300 px-3 py-2"
              />
            </label>
          )}

          <PhotoUploader onUploaded={(mid) => setPhotoIds((prev) => [...prev, mid])} />
          <p className="text-xs text-gray-500">사진 {photoIds.length}장 첨부됨</p>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white disabled:opacity-50"
          >
            {action.label}
          </button>
        </section>
      ) : (
        delivery && (
          <p className="rounded-lg bg-green-50 px-4 py-3 text-center text-sm font-semibold text-green-700">
            {delivery.status === 'DELIVERED' ? '배달이 완료되었습니다.' : '진행할 단계가 없습니다.'}
          </p>
        )
      )}
    </main>
  );
}
