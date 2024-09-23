import OrderCheckBox from '@/components/order/OrderCheckBox';
import Link from 'next/link';
import React, { useState } from 'react';

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
      <OrderCheckBox id="refund" checked={refundConsent} onChange={setRefundConsent} type="circle">
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
        checked={contentAgreement}
        onChange={handleContentAgreement}
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
        checked={personalInfoConsent}
        onChange={handlePersonalInfoConsent}
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
        checked={thirdPartyConsent}
        onChange={handleThirdPartyConsent}
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
