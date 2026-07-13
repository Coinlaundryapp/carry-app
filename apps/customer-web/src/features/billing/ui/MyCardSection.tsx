'use client';

import { useCallback, useState } from 'react';
import Button from '@shared/ui/Button';
import { useMyBillingKey } from '../model/useMyBillingKey';
import BillingKeyRegistrationSheet from './BillingKeyRegistrationSheet';

/**
 * 마이페이지 결제수단 섹션.
 *
 * - 등록된 카드가 있으면 카드사 + 마스킹 번호를 보여주고 "변경" 버튼으로 재등록 시트를 연다.
 * - 없으면 안내 문구와 "카드 등록" 버튼을 보여준다.
 * - 시트는 등록/변경 두 경우 모두 동일한 BillingKeyRegistrationSheet(F4)를 재사용한다.
 *   성공 시 useRegisterBillingKey가 useMyBillingKey 쿼리를 무효화하므로 요약이 자동 갱신된다.
 */
export default function MyCardSection() {
  const { data: billingKey, isLoading } = useMyBillingKey();
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleSuccess = useCallback(() => {
    setSheetOpen(false);
  }, []);

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-label-normal font-headline-1 font-semibold">결제수단</h2>

      {isLoading && (
        <p className="text-label-assistive font-body-1-normal">카드 정보를 불러오는 중이에요.</p>
      )}

      {!isLoading && billingKey && (
        <div className="flex items-center justify-between">
          <p className="text-label-neutral font-body-1-normal font-semibold">
            {billingKey.cardCompany} •••• {billingKey.cardLast4}
          </p>
          <Button state="secondary" size="hug" onClick={() => setSheetOpen(true)}>
            변경
          </Button>
        </div>
      )}

      {!isLoading && !billingKey && (
        <div className="flex items-center justify-between">
          <p className="text-label-assistive font-body-1-normal">등록된 카드가 없어요.</p>
          <Button state="fillPrimary" size="hug" onClick={() => setSheetOpen(true)}>
            카드 등록
          </Button>
        </div>
      )}

      <BillingKeyRegistrationSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSuccess={handleSuccess}
      />
    </section>
  );
}
