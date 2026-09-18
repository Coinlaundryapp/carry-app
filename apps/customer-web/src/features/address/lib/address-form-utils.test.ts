import { describe, it, expect } from 'vitest';
import type { TAddressRes } from '@shared/types/api-types';
import {
  requestToDeliveryNotes,
  deliveryNotesToRequest,
  buildAddressPayload,
  addressResponseToFormData,
} from './address-form-utils';

describe('address-form-utils', () => {
  describe('requestToDeliveryNotes', () => {
    it("value '1' → '문 앞에 놓아주세요.'", () => {
      const result = requestToDeliveryNotes({ value: '1', requestText: '' });
      expect(result).toBe('문 앞에 놓아주세요.');
    });

    it("value '2' → '경비실에 맡겨 주세요'", () => {
      const result = requestToDeliveryNotes({ value: '2', requestText: '' });
      expect(result).toBe('경비실에 맡겨 주세요');
    });

    it("value '3' → '택배함에 넣어 주세요.'", () => {
      const result = requestToDeliveryNotes({ value: '3', requestText: '' });
      expect(result).toBe('택배함에 넣어 주세요.');
    });

    it("value '4' → requestText 그대로 반환", () => {
      const result = requestToDeliveryNotes({
        value: '4',
        requestText: '현관 비밀번호 1234입니다',
      });
      expect(result).toBe('현관 비밀번호 1234입니다');
    });

    it('존재하지 않는 value → 빈 문자열', () => {
      const result = requestToDeliveryNotes({ value: '99', requestText: '' });
      expect(result).toBe('');
    });
  });

  describe('deliveryNotesToRequest', () => {
    it("'경비실에 맡겨 주세요' → value '2'", () => {
      const result = deliveryNotesToRequest('경비실에 맡겨 주세요');
      expect(result.value).toBe('2');
      expect(result.requestText).toBe('경비실에 맡겨 주세요');
    });

    it("'문 앞에 놓아주세요.' → value '1'", () => {
      const result = deliveryNotesToRequest('문 앞에 놓아주세요.');
      expect(result.value).toBe('1');
    });

    it("'택배함에 넣어 주세요.' → value '3'", () => {
      const result = deliveryNotesToRequest('택배함에 넣어 주세요.');
      expect(result.value).toBe('3');
    });

    it("커스텀 텍스트 → value '4' + requestText", () => {
      const result = deliveryNotesToRequest('벨 누르지 말아주세요');
      expect(result.value).toBe('4');
      expect(result.requestText).toBe('벨 누르지 말아주세요');
    });

    it("빈 문자열 → 기본값 value '1'", () => {
      const result = deliveryNotesToRequest('');
      expect(result.value).toBe('1');
      expect(result.requestText).toBe('');
    });
  });

  describe('buildAddressPayload', () => {
    it('모든 필드 정상 매핑 확인', () => {
      const result = buildAddressPayload(
        { addressLabel: '집', name: '홍길동', phone: '010-1234-5678' },
        { main: '서울시 강남구', detail: '101호' },
        { value: '2', text: '비밀번호 1234' },
        { value: '1', requestText: '' },
      );

      expect(result.addressLabel).toBe('집');
      expect(result.recipientName).toBe('홍길동');
      expect(result.recipientPhone).toBe('010-1234-5678');
      expect(result.baseAddress).toBe('서울시 강남구');
      expect(result.detailAddress).toBe('101호');
    });

    it('entranceType, deliveryNotes 포함 확인', () => {
      const result = buildAddressPayload(
        { addressLabel: '회사', name: '김철수', phone: '010-9876-5432' },
        { main: '서울시 서초구', detail: '202호' },
        { value: '3', text: '' },
        { value: '2', requestText: '' },
      );

      expect(result.entranceType).toBe('3');
      expect(result.deliveryNotes).toBe('경비실에 맡겨 주세요');
      expect(result.entranceDetail).toBe('');
    });

    it("직접 입력(value '4') 시 requestText가 deliveryNotes에 매핑", () => {
      const result = buildAddressPayload(
        { addressLabel: '집', name: '홍길동', phone: '010-1234-5678' },
        { main: '서울시 강남구', detail: '101호' },
        { value: '1', text: '' },
        { value: '4', requestText: '벨 누르지 마세요' },
      );

      expect(result.deliveryNotes).toBe('벨 누르지 마세요');
    });

    it('geo 인자 → 좌표·우편번호·권역이 페이로드에 포함', () => {
      const result = buildAddressPayload(
        { addressLabel: '집', name: '홍길동', phone: '010-1234-5678' },
        { main: '서울시 강남구', detail: '101호' },
        { value: '1', text: '' },
        { value: '1', requestText: '' },
        { latitude: 37.5, longitude: 127.03, zipCode: '06234', areaCode: 'GANGNAM' },
      );

      expect(result).toMatchObject({
        latitude: 37.5,
        longitude: 127.03,
        zipCode: '06234',
        areaCode: 'GANGNAM',
      });
    });

    it('geo 미지정 → 지오 필드 undefined(매핑 레이어가 기본값 보정)', () => {
      const result = buildAddressPayload(
        { addressLabel: '집', name: '홍길동', phone: '010-1234-5678' },
        { main: '서울시 강남구', detail: '101호' },
        { value: '1', text: '' },
        { value: '1', requestText: '' },
      );

      expect(result.latitude).toBeUndefined();
      expect(result.areaCode).toBeUndefined();
    });
  });

  describe('addressResponseToFormData', () => {
    const mockResponse: TAddressRes = {
      id: 1,
      userId: 100,
      addressLabel: '집',
      recipientName: '홍길동',
      recipientPhone: '010-1234-5678',
      baseAddress: '서울시 강남구 역삼동',
      detailAddress: '101동 202호',
      deliveryNotes: '문 앞에 놓아주세요.',
      entranceType: '2',
      entranceDetail: '비밀번호 4321',
      isDefaultAddress: false,
    };

    it('API 응답 → 폼 데이터 정확한 매핑', () => {
      const result = addressResponseToFormData(mockResponse);

      expect(result.formData).toEqual({
        addressLabel: '집',
        name: '홍길동',
        phone: '010-1234-5678',
      });
      expect(result.address).toEqual({
        main: '서울시 강남구 역삼동',
        detail: '101동 202호',
      });
      expect(result.entrance).toEqual({
        value: '2',
        text: '비밀번호 4321',
      });
      expect(result.request.value).toBe('1');
      expect(result.request.requestText).toBe('문 앞에 놓아주세요.');
    });

    it('지오 필드 → geo로 라운드트립 보존', () => {
      const withGeo: TAddressRes = {
        ...mockResponse,
        latitude: 37.5065,
        longitude: 127.0536,
        zipCode: '06234',
        areaCode: 'GANGNAM',
      };
      const result = addressResponseToFormData(withGeo);
      expect(result.geo).toEqual({
        latitude: 37.5065,
        longitude: 127.0536,
        zipCode: '06234',
        areaCode: 'GANGNAM',
      });
    });

    it('커스텀 deliveryNotes → request value 4', () => {
      const customResponse: TAddressRes = {
        ...mockResponse,
        deliveryNotes: '벨 누르지 말아주세요',
      };
      const result = addressResponseToFormData(customResponse);
      expect(result.request.value).toBe('4');
      expect(result.request.requestText).toBe('벨 누르지 말아주세요');
    });

    it('빈 deliveryNotes → 기본값 value 1', () => {
      const emptyNotesResponse: TAddressRes = {
        ...mockResponse,
        deliveryNotes: '',
      };
      const result = addressResponseToFormData(emptyNotesResponse);
      expect(result.request.value).toBe('1');
      expect(result.request.requestText).toBe('');
    });
  });
});
