import { cn } from '@/lib/utils';
import { CheckIcon } from '@assets/icons';
import Link from 'next/link';
import React, { useState } from 'react';

function CheckBox({
  id,
  type,
  checked,
  onChange,
  children,
  className,
}: Readonly<{
  id: string;
  type: 'circle' | 'check';
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  children: React.ReactNode;
}>) {
  return (
    <div
      className={cn('flex space-x-3 px-4', className, {
        'py-2': type === 'circle',
        'py-1': type === 'check',
      })}
    >
      <button
        className={cn(
          'flex h-[18px] w-[18px] flex-shrink-0 cursor-pointer items-center justify-center',
          {
            'mt-[2px] rounded-full bg-label-assistive': type === 'circle',
            'bg-primary-normal': type === 'circle' && checked,
            'bg-transparent': type === 'check',
          },
        )}
        onClick={() => onChange(!checked)}
      >
        <CheckIcon
          className={cn('fill-static-white', {
            'fill-label-assistive': type === 'check' && !checked,
            'fill-primary-normal': type === 'check' && checked,
          })}
        />
      </button>
      <div className="flex w-full items-start justify-between">
        <label
          htmlFor={id}
          className={cn('cursor-pointer text-sm leading-none font-label-1-reading', {
            'font-semibold text-label-neutral': type === 'circle',
            'font-medium text-label-alternative': type === 'check',
          })}
        >
          {children}
        </label>
        {type === 'check' && (
          <Link
            href="#"
            className="font-normal text-label-alternative underline font-label-1-normal"
          >
            보기
          </Link>
        )}
      </div>
    </div>
  );
}

export default function PrivacyField() {
  const [refundConsent, setRefundConsent] = useState(false);
  const [contentAgreement, setContentAgreement] = useState(false);
  const [personalInfoConsent, setPersonalInfoConsent] = useState(false);
  const [thirdPartyConsent, setThirdPartyConsent] = useState(false);

  const handleContentAgreement = (checked: boolean) => {
    if (checked) {
      setPersonalInfoConsent(true);
      setThirdPartyConsent(true);
    }
    setContentAgreement(checked);
    setPersonalInfoConsent(checked);
    setThirdPartyConsent(checked);
  };

  const handlePersonalInfoConsent = (checked: boolean) => {
    setPersonalInfoConsent(checked);
    updateContentAgreement(checked, thirdPartyConsent);
  };

  const handleThirdPartyConsent = (checked: boolean) => {
    setThirdPartyConsent(checked);
    updateContentAgreement(personalInfoConsent, checked);
  };

  const updateContentAgreement = (personalInfo: boolean, thirdParty: boolean) => {
    if (personalInfo && thirdParty) {
      setContentAgreement(true);
    } else {
      setContentAgreement(false);
    }
  };

  return (
    <section className="py-5">
      <CheckBox id="refund" checked={refundConsent} onChange={setRefundConsent} type="circle">
        세탁이 진행된 후, 결제하지 않으면 세탁물을 돌려 받으실 수 없습니다{' '}
        <span className="text-status-destructive">*</span>
      </CheckBox>
      <CheckBox
        id="content-agreement"
        type="circle"
        checked={contentAgreement}
        onChange={handleContentAgreement}
      >
        주문 내용을 확인하였으며, 정보 제공 등에 동의합니다
      </CheckBox>
      <CheckBox
        id="personal-info"
        type="check"
        checked={personalInfoConsent}
        onChange={handlePersonalInfoConsent}
      >
        (필수) 개인정보 수집 / 이용 동의
      </CheckBox>
      <CheckBox
        id="third-party"
        type="check"
        checked={thirdPartyConsent}
        onChange={handleThirdPartyConsent}
      >
        (필수) 개인정보 제3자 제공 동의
      </CheckBox>
    </section>
  );
}
