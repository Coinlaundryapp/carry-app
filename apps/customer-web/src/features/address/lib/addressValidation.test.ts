import { describe, it, expect } from 'vitest';
import { validateForm, validateAllSteps } from './addressValidation';

const baseInput = {
  step: 1,
  formData: { name: '홍길동', phone: '010-1234-5678', addressLabel: '우리집' },
  address: { main: '서울시 강남구', detail: '101동 202호' },
  selectedValue: { value: '2', text: '' },
  selectedRequest: { value: '1', requestText: '' },
};

describe('validateForm (단계별 검증)', () => {
  it('step 1: 주소 라벨이 비어있으면 false', () => {
    expect(
      validateForm({
        ...baseInput,
        step: 1,
        formData: { ...baseInput.formData, addressLabel: '' },
      }),
    ).toBe(false);
  });

  it('step 1: 주소 라벨이 있으면 true', () => {
    expect(validateForm({ ...baseInput, step: 1 })).toBe(true);
  });

  it('step 2: 이름이 비어있으면 false', () => {
    expect(
      validateForm({
        ...baseInput,
        step: 2,
        formData: { ...baseInput.formData, name: '' },
      }),
    ).toBe(false);
  });

  it('step 2: 이름이 있으면 true', () => {
    expect(validateForm({ ...baseInput, step: 2 })).toBe(true);
  });

  it('step 3: 주소 메인 또는 상세가 비어있으면 false', () => {
    expect(validateForm({ ...baseInput, step: 3, address: { main: '', detail: '101동' } })).toBe(
      false,
    );
    expect(validateForm({ ...baseInput, step: 3, address: { main: '서울시', detail: '' } })).toBe(
      false,
    );
    expect(
      validateForm({ ...baseInput, step: 3, address: { main: '서울시', detail: '101동' } }),
    ).toBe(true);
  });

  it('step 4: 일반 선택은 value만 있으면 true', () => {
    expect(validateForm({ ...baseInput, step: 4, selectedValue: { value: '2', text: '' } })).toBe(
      true,
    );
  });

  it('step 4: 직접입력(1,5)은 text가 있어야 true', () => {
    expect(validateForm({ ...baseInput, step: 4, selectedValue: { value: '1', text: '' } })).toBe(
      false,
    );
    expect(
      validateForm({ ...baseInput, step: 4, selectedValue: { value: '1', text: '특별 세탁' } }),
    ).toBe(true);
    expect(
      validateForm({ ...baseInput, step: 4, selectedValue: { value: '5', text: '기타 요청' } }),
    ).toBe(true);
  });

  it('step 5: 직접입력(4)은 requestText가 있어야 true', () => {
    expect(
      validateForm({
        ...baseInput,
        step: 5,
        selectedRequest: { value: '4', requestText: '' },
      }),
    ).toBe(false);
    expect(
      validateForm({
        ...baseInput,
        step: 5,
        selectedRequest: { value: '4', requestText: '문앞에 놓아주세요' },
      }),
    ).toBe(true);
  });

  it('step 6: 전화번호 형식 010-XXXX-XXXX 검증', () => {
    expect(
      validateForm({
        ...baseInput,
        step: 6,
        formData: { ...baseInput.formData, phone: '010-1234-5678' },
      }),
    ).toBe(true);
    expect(
      validateForm({
        ...baseInput,
        step: 6,
        formData: { ...baseInput.formData, phone: '01012345678' },
      }),
    ).toBe(false);
    expect(
      validateForm({
        ...baseInput,
        step: 6,
        formData: { ...baseInput.formData, phone: '011-1234-5678' },
      }),
    ).toBe(false);
  });

  it('정의되지 않은 step은 true 반환', () => {
    expect(validateForm({ ...baseInput, step: 99 })).toBe(true);
  });
});

describe('validateAllSteps (전체 검증)', () => {
  it('모든 필드가 유효하면 true', () => {
    expect(validateAllSteps(baseInput)).toBe(true);
  });

  it('하나라도 비어있으면 false', () => {
    expect(
      validateAllSteps({
        ...baseInput,
        formData: { ...baseInput.formData, name: '' },
      }),
    ).toBe(false);

    expect(
      validateAllSteps({
        ...baseInput,
        address: { main: '', detail: '' },
      }),
    ).toBe(false);
  });

  it('전화번호 형식이 맞지 않으면 false', () => {
    expect(
      validateAllSteps({
        ...baseInput,
        formData: { ...baseInput.formData, phone: '123' },
      }),
    ).toBe(false);
  });
});
