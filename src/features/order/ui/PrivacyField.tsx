import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import OrderCheckBox from '@features/order/ui/OrderCheckBox';

interface PrivacyFieldProps {
  onAllConsentsGiven: (allConsentsGiven: boolean) => void;
}

export default function PrivacyField({ onAllConsentsGiven }: PrivacyFieldProps) {
  const [consents, setConsents] = useState({
    refundConsent: false,
    contentAgreement: false,
    personalInfoConsent: false,
    thirdPartyConsent: false,
  });

  useEffect(() => {
    const allConsentsGiven = Object.values(consents).every(Boolean);
    onAllConsentsGiven(allConsentsGiven);
  }, [consents, onAllConsentsGiven]);

  const updateConsents = (key: keyof typeof consents, value: boolean) => {
    setConsents((prev) => {
      const newState = { ...prev, [key]: value };

      if (key === 'contentAgreement') {
        newState.personalInfoConsent = value;
        newState.thirdPartyConsent = value;
      } else if (key === 'personalInfoConsent' || key === 'thirdPartyConsent') {
        newState.contentAgreement = newState.personalInfoConsent && newState.thirdPartyConsent;
      }

      return newState;
    });
  };

  const handleConsentChange = (key: keyof typeof consents) => (checked: boolean) => {
    updateConsents(key, checked);
  };

  return (
    <section className="py-5">
      <OrderCheckBox
        id="refund"
        checked={consents.refundConsent}
        onChange={handleConsentChange('refundConsent')}
        type="circle"
      >
        <div className="flex w-full items-start justify-between">
          <label className="font-semibold text-label-neutral font-label-1-reading">
            세탁이 진행된 후, 결제하지 않으면 세탁물을 돌려 받으실 수 없습니다{' '}
            <span className="text-status-destructive">*</span>
          </label>
        </div>
      </OrderCheckBox>
      <OrderCheckBox
        id="content-agreement"
        type="circle"
        checked={consents.contentAgreement}
        onChange={handleConsentChange('contentAgreement')}
      >
        <div className="flex w-full items-start justify-between">
          <label className="font-semibold text-label-neutral font-label-1-reading">
            주문 내용을 확인하였으며, 정보 제공 등에 동의합니다
          </label>
        </div>
      </OrderCheckBox>
      <OrderCheckBox
        id="personal-info"
        type="check"
        checked={consents.personalInfoConsent}
        onChange={handleConsentChange('personalInfoConsent')}
      >
        <div className="flex w-full items-start justify-between">
          <label className="font-medium text-label-alternative font-label-1-reading">
            (필수) 개인정보 수집 / 이용 동의
          </label>
          <Link
            href="#"
            className="font-normal text-label-alternative underline font-label-1-normal"
          >
            보기
          </Link>
        </div>
      </OrderCheckBox>
      <OrderCheckBox
        id="third-party"
        type="check"
        checked={consents.thirdPartyConsent}
        onChange={handleConsentChange('thirdPartyConsent')}
      >
        <div className="flex w-full items-start justify-between">
          <label className="font-medium text-label-alternative font-label-1-reading">
            (필수) 개인정보 제3자 제공 동의
          </label>
          <Link
            href="#"
            className="font-normal text-label-alternative underline font-label-1-normal"
          >
            보기
          </Link>
        </div>
      </OrderCheckBox>
    </section>
  );
}
