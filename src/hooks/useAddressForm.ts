'use client';

import { useState, useEffect, useCallback } from 'react';
import { validateAllSteps, validateForm } from '@/validations/addressValidation';
import { REQUEST_OPTIONS } from '@/constants/request-options';
import { formatPhoneNumber } from '@/utils/formaPhoneNumber';

// ── 공유 타입 ──

export type AddressFormData = {
  addressLabel: string;
  name: string;
  phone: string;
};

export type AddressEntry = {
  main: string;
  detail: string;
};

export type EntranceSelection = {
  value: string;
  text: string;
};

export type RequestSelection = {
  value: string;
  requestText: string;
};

/** @deprecated TSelectedRequest → RequestSelection 으로 이름 변경됨 */
export type TSelectedRequest = RequestSelection;

// ── 훅 ──

export function useAddressForm() {
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState<AddressEntry>({ main: '', detail: '' });
  const [selectedValue, setSelectedValue] = useState<EntranceSelection>({
    value: '1',
    text: '',
  });
  const [selectedRequest, setSelectedRequest] = useState<RequestSelection>({
    value: '1',
    requestText: '',
  });
  const [isValid, setIsValid] = useState(false);
  const [allStepsValid, setAllStepsValid] = useState(false);
  const [formData, setFormData] = useState<AddressFormData>({
    addressLabel: '',
    name: '',
    phone: '',
  });

  // ── 핸들러 ──

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData((prev) => ({ ...prev, phone: formatted }));
  }, []);

  const handleChange = useCallback((value: string) => {
    setSelectedValue((prev) => ({ ...prev, value }));
  }, []);

  const handleMainAddressChange = useCallback((value: string) => {
    setAddress((prev) => ({ ...prev, main: value }));
  }, []);

  const handleExtraInfoChange = useCallback((text: string) => {
    setSelectedValue((prev) => ({ ...prev, text }));
  }, []);

  const handleNext = useCallback(() => {
    setStep((prev) => (isValid ? prev + 1 : prev));
  }, [isValid]);

  const handleChangeRequest = useCallback((value: string) => {
    setSelectedRequest((prev) => ({ ...prev, value }));
  }, []);

  const handleChangeRequestText = useCallback((requestText: string) => {
    setSelectedRequest((prev) => ({ ...prev, requestText }));
  }, []);

  // ── 유효성 검증 ──

  useEffect(() => {
    const input = { step, formData, address, selectedValue, selectedRequest };
    setIsValid(validateForm(input));
    setAllStepsValid(validateAllSteps(input));
  }, [step, formData, address, selectedValue, selectedRequest]);

  // ── 주소 페이로드 빌드 ──

  const buildPayload = useCallback(() => {
    let deliveryNotes = '';
    if (selectedRequest.value === '4') {
      deliveryNotes = selectedRequest.requestText;
    } else {
      const option = REQUEST_OPTIONS.find((o) => o.value === selectedRequest.value);
      deliveryNotes = option ? option.label : '';
    }

    return {
      addressLabel: formData.addressLabel,
      recipientPhone: formData.phone,
      recipientName: formData.name,
      baseAddress: address.main,
      detailAddress: address.detail,
      deliveryNotes,
      entranceType: selectedValue.value,
      entranceDetail: selectedValue.text,
    };
  }, [formData, address, selectedValue, selectedRequest]);

  // ── 편집 모드: 기존 데이터로 폼 채우기 ──

  const populateForm = useCallback((data: any) => {
    if (!data) return;
    setFormData({
      addressLabel: data.addressLabel || '',
      name: data.recipientName || '',
      phone: data.recipientPhone || '',
    });
    setAddress({
      main: data.baseAddress || '',
      detail: data.detailAddress || '',
    });
    setSelectedValue({
      value: data.entranceType || '1',
      text: data.entranceDetail || '',
    });
    setSelectedRequest({
      value: data.deliveryNotes
        ? REQUEST_OPTIONS.find((option) => option.label === data.deliveryNotes)?.value || '4'
        : '1',
      requestText: data.deliveryNotes || '',
    });
  }, []);

  return {
    // 상태
    step,
    address,
    selectedValue,
    selectedRequest,
    isValid,
    allStepsValid,
    formData,
    setFormData,
    setAddress,

    // 핸들러
    handlePhoneChange,
    handleChange,
    handleMainAddressChange,
    handleExtraInfoChange,
    handleNext,
    handleChangeRequest,
    handleChangeRequestText,

    // 유틸
    buildPayload,
    populateForm,
  };
}
