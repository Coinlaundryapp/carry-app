'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import Button from '@shared/ui/Button';
import BillingKeyRegistrationSheet from './BillingKeyRegistrationSheet';

/**
 * 미납 인보이스로 주문 생성이 막혔을 때(백엔드 409 OVERDUE_INVOICE_EXISTS) 노출되는 화면.
 *
 * 설계상 특정 인보이스 상태를 폴링하지 않는다 — 카드 재등록까지만 프론트가 책임지고,
 * 실제 미납분 재결제는 백엔드 ChargeRetrySweeper가 자체 스케줄로 처리한다.
 * 재결제 완료 여부는 이후 사용자가 다시 주문을 시도할 때 409가 더 이상 발생하지 않는 것으로 확인된다.
 */
export default function OverdueResolution() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [registered, setRegistered] = useState(false);

  const handleSheetSuccess = useCallback(() => {
    setSheetOpen(false);
    setRegistered(true);
  }, []);

  if (registered) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-label-normal font-heading-1 font-semibold">카드를 등록했어요.</h2>
          <p className="text-label-alternative font-body-1-normal">
            미납분 재결제가 처리되면 다시 주문할 수 있어요.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Link href="/">
            <Button size="full" state="fillPrimary">
              홈으로
            </Button>
          </Link>
          <Link href="/status">
            <Button size="full" state="secondary">
              내 주문 보기
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-label-normal font-heading-1 font-semibold">미납 결제가 있어요.</h2>
        <p className="text-label-alternative font-body-1-normal">
          미납 결제가 있어 새 주문을 만들 수 없어요. 카드를 다시 등록하면 잠시 후 자동으로
          재결제됩니다.
        </p>
      </div>
      <Button size="full" state="fillPrimary" onClick={() => setSheetOpen(true)}>
        카드 다시 등록
      </Button>

      <BillingKeyRegistrationSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSuccess={handleSheetSuccess}
      />
    </div>
  );
}
