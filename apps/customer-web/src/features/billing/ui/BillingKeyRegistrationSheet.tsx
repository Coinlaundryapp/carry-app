'use client';

import { useEffect, useState } from 'react';
import { CARD_INSTITUTIONS } from '@features/payment';
import { useToastStore } from '@shared/model/toast-store';
import Button from '@shared/ui/Button';
import Dropdown from '@shared/ui/Dropdown/Dropdown';
import { Input } from '@shared/ui/Input';
import { Drawer, DrawerContent } from '@shared/ui/primitives/drawer';
import { useRegisterBillingKey } from '../model/useRegisterBillingKey';

// 카드번호 형식 검증(16자리 숫자)만 수행한다. 값 자체는 어디로도 전송되지 않는다.
const CARD_NUMBER_PATTERN = /^\d{16}$/;
// 등록 성공 후 마스킹된 카드 정보를 잠시 보여주고 onSuccess를 호출하기까지의 지연(ms).
const SUCCESS_DISPLAY_MS = 1200;

export interface BillingKeyRegistrationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function BillingKeyRegistrationSheet({
  open,
  onOpenChange,
  onSuccess,
}: Readonly<BillingKeyRegistrationSheetProps>) {
  const [cardCompany, setCardCompany] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const addToast = useToastStore((state) => state.addToast);
  const mutation = useRegisterBillingKey();

  // 시트가 닫히면 다음에 열 때를 대비해 폼/뮤테이션 상태를 초기화한다.
  useEffect(() => {
    if (!open) {
      setCardCompany('');
      setCardNumber('');
      mutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (mutation.isSuccess) {
      const timer = setTimeout(() => {
        onSuccess();
      }, SUCCESS_DISPLAY_MS);
      return () => clearTimeout(timer);
    }
  }, [mutation.isSuccess, onSuccess]);

  const isCardNumberValid = CARD_NUMBER_PATTERN.test(cardNumber.replace(/\s/g, ''));
  const canSubmit = cardCompany !== '' && isCardNumberValid && !mutation.isPending;

  const handleSubmit = () => {
    // 목 등록 — 카드번호는 백엔드로 전송하지 않음(authKey만 필요).
    // 실 Toss requestBillingAuth 시 이 폼을 SDK 카드창으로 교체.
    mutation.mutate(undefined, {
      onError: (error) => {
        const message =
          error instanceof Error ? error.message : '카드 등록 중 오류가 발생했습니다.';
        addToast({ message, type: 'error' });
      },
    });
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent showIndicator className="flex flex-col px-6 pb-[20px] pt-[30px]">
        <p className="text-label-strong font-heading-2 mb-6 text-center font-semibold">카드 등록</p>
        {mutation.isSuccess && mutation.data ? (
          <div className="mb-6 text-center">
            <p className="text-label-neutral font-body-1-reading font-semibold">
              {mutation.data.cardCompany} {mutation.data.cardLast4} 카드가 등록되었습니다.
            </p>
          </div>
        ) : (
          <div className="mb-6 flex flex-col gap-4">
            <Dropdown
              data={[...CARD_INSTITUTIONS]}
              value={cardCompany}
              onChange={setCardCompany}
              placeholder="카드사 선택"
              indicator="radio"
            />
            <Input
              type="number"
              status="primary"
              title="카드번호"
              placeholder="16자리 숫자를 입력하세요"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
            />
            <Button
              state={canSubmit ? 'fillPrimary' : 'disabled'}
              size="full"
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              카드 등록
            </Button>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
