import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAddressForm } from './useAddressForm';
import type { TAddressRes } from '@shared/types/api-types';

describe('useAddressForm', () => {
  // ── 초기 상태 ──

  it('초기 상태: step=1, formData 빈 값, isValid=false', () => {
    const { result } = renderHook(() => useAddressForm());

    expect(result.current.step).toBe(1);
    expect(result.current.formData).toEqual({
      addressLabel: '',
      name: '',
      phone: '',
    });
    expect(result.current.address).toEqual({ main: '', detail: '' });
    expect(result.current.isValid).toBe(false);
    expect(result.current.allStepsValid).toBe(false);
  });

  // ── 핸들러 테스트 ──

  it('handlePhoneChange → 전화번호 포맷팅 적용', () => {
    const { result } = renderHook(() => useAddressForm());

    act(() => {
      result.current.handlePhoneChange({
        target: { value: '01012345678' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.formData.phone).toBe('010-1234-5678');
  });

  it('handleMainAddressChange → 주소 main 필드 변경', () => {
    const { result } = renderHook(() => useAddressForm());

    act(() => {
      result.current.handleMainAddressChange('서울시 강남구 테헤란로 123');
    });

    expect(result.current.address.main).toBe('서울시 강남구 테헤란로 123');
  });

  it('handleChange → entrance value 변경', () => {
    const { result } = renderHook(() => useAddressForm());

    act(() => {
      result.current.handleChange('3');
    });

    expect(result.current.selectedValue.value).toBe('3');
  });

  it('handleExtraInfoChange → entrance text 변경', () => {
    const { result } = renderHook(() => useAddressForm());

    act(() => {
      result.current.handleExtraInfoChange('공동현관 비밀번호 1234');
    });

    expect(result.current.selectedValue.text).toBe('공동현관 비밀번호 1234');
  });

  it('handleChangeRequest → request value 변경', () => {
    const { result } = renderHook(() => useAddressForm());

    act(() => {
      result.current.handleChangeRequest('2');
    });

    expect(result.current.selectedRequest.value).toBe('2');
  });

  it('handleChangeRequestText → request text 변경', () => {
    const { result } = renderHook(() => useAddressForm());

    act(() => {
      result.current.handleChangeRequestText('경비실에 맡겨주세요');
    });

    expect(result.current.selectedRequest.requestText).toBe('경비실에 맡겨주세요');
  });

  // ── step 진행 ──

  it('handleNext: isValid=false일 때 step 유지', () => {
    const { result } = renderHook(() => useAddressForm());

    // step 1에서 addressLabel이 비어있으므로 isValid=false
    expect(result.current.isValid).toBe(false);

    act(() => {
      result.current.handleNext();
    });

    expect(result.current.step).toBe(1);
  });

  it('handleNext: isValid=true일 때 step 증가', () => {
    const { result } = renderHook(() => useAddressForm());

    // step 1: addressLabel을 채워서 isValid=true로 만듦
    act(() => {
      result.current.setFormData((prev) => ({ ...prev, addressLabel: '집' }));
    });

    // useEffect가 isValid를 true로 갱신할 때까지 기다림
    expect(result.current.isValid).toBe(true);

    act(() => {
      result.current.handleNext();
    });

    expect(result.current.step).toBe(2);
  });

  // ── buildPayload ──

  it('buildPayload → 현재 상태로 페이로드 조립', () => {
    const { result } = renderHook(() => useAddressForm());

    act(() => {
      result.current.setFormData({
        addressLabel: '집',
        name: '홍길동',
        phone: '010-1234-5678',
      });
      result.current.setAddress({ main: '서울시 강남구', detail: '101동' });
      result.current.handleChange('3');
      result.current.handleExtraInfoChange('비밀번호 1234');
      result.current.handleChangeRequest('1');
    });

    const payload = result.current.buildPayload();

    expect(payload).toMatchObject({
      addressLabel: '집',
      recipientName: '홍길동',
      recipientPhone: '010-1234-5678',
      baseAddress: '서울시 강남구',
      detailAddress: '101동',
      entranceType: '3',
      entranceDetail: '비밀번호 1234',
    });
  });

  // ── populateForm ──

  it('populateForm → TAddressRes 데이터로 폼 채우기', () => {
    const { result } = renderHook(() => useAddressForm());

    const mockRes: TAddressRes = {
      id: 1,
      userId: 100,
      addressLabel: '회사',
      recipientName: '김철수',
      recipientPhone: '010-9876-5432',
      baseAddress: '서울시 서초구 서초대로 456',
      detailAddress: '5층',
      deliveryNotes: '문 앞에 놓아주세요',
      entranceType: 'PASSWORD',
      entranceDetail: '5678',
      isDefaultAddress: false,
    };

    act(() => {
      result.current.populateForm(mockRes);
    });

    expect(result.current.formData.addressLabel).toBe('회사');
    expect(result.current.formData.name).toBe('김철수');
    expect(result.current.formData.phone).toBe('010-9876-5432');
    expect(result.current.address.main).toBe('서울시 서초구 서초대로 456');
    expect(result.current.address.detail).toBe('5층');
    expect(result.current.selectedValue.value).toBe('PASSWORD');
    expect(result.current.selectedValue.text).toBe('5678');
  });

  it('populateForm: undefined 전달 시 상태 변경 없음', () => {
    const { result } = renderHook(() => useAddressForm());

    const before = { ...result.current.formData };

    act(() => {
      result.current.populateForm(undefined);
    });

    expect(result.current.formData).toEqual(before);
  });
});
