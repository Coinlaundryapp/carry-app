'use client';

import { useState, useEffect, useCallback } from 'react';
import { validateAllSteps, validateForm } from '@features/address/lib/addressValidation';
import {
  buildAddressPayload,
  addressResponseToFormData,
  type AddressGeo,
} from '@features/address/lib/address-form-utils';
import { formatPhoneNumber } from '@shared/lib/formatPhoneNumber';
import type { TAddressRes } from '@shared/types/api-types';

/** 주소검색(geocode) 결과에서 폼으로 가져오는 선택 항목. */
export type AddressSelection = {
  addressName: string;
  latitude?: number;
  longitude?: number;
  zipCode?: string;
};

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
  // v2 필수 지오 필드 — 주소검색 선택/편집 라운드트립으로 채워진다.
  const [geo, setGeo] = useState<AddressGeo>({});

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

  /**
   * 주소검색 결과 선택 — 도로명/지번을 main에 넣고, geocode가 준 좌표·우편번호를
   * 폼 지오 상태에 보존한다(생성 페이로드의 v2 필수 필드 출처).
   */
  const handleAddressSelect = useCallback((selected: AddressSelection) => {
    setAddress((prev) => ({ ...prev, main: selected.addressName }));
    setGeo((prev) => ({
      ...prev,
      latitude: selected.latitude,
      longitude: selected.longitude,
      zipCode: selected.zipCode,
    }));
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

  const buildPayload = useCallback(
    () => buildAddressPayload(formData, address, selectedValue, selectedRequest, geo),
    [formData, address, selectedValue, selectedRequest, geo],
  );

  // ── 편집 모드: 기존 데이터로 폼 채우기 ──

  const populateForm = useCallback((data: TAddressRes | undefined) => {
    if (!data) return;
    const result = addressResponseToFormData(data);
    setFormData(result.formData);
    setAddress(result.address);
    setSelectedValue(result.entrance);
    setSelectedRequest(result.request);
    setGeo(result.geo);
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
    handleAddressSelect,
    handleExtraInfoChange,
    handleNext,
    handleChangeRequest,
    handleChangeRequestText,

    // 유틸
    buildPayload,
    populateForm,
  };
}
