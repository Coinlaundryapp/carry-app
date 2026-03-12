import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { mockData } from '@/test/mocks/handlers';
import {
  getAddresses,
  getAddressSearchList,
  getAddress,
  postAddress,
  putAddress,
  deleteAddress,
  patchDefaultAddress,
  getDefaultAddress,
} from './addressApi';

const TOKEN = 'test-access-token';

const samplePayload = {
  addressLabel: '집',
  recipientPhone: '010-1234-5678',
  recipientName: '홍길동',
  baseAddress: '서울시 강남구 테헤란로 123',
  detailAddress: '101동 202호',
  deliveryNotes: '문 앞에 놓아주세요',
  entranceType: 'PASSWORD',
  entranceDetail: '1234',
};

describe('addressApi', () => {
  describe('getAddresses', () => {
    it('정상 응답 → 주소 배열 반환', async () => {
      const result = await getAddresses(TOKEN);
      expect(result).toEqual(mockData.addressList);
    });

    it('401 응답 → ApiError 발생', async () => {
      server.use(
        http.get('*/api/v1/users/me/shipping-addresses', () => {
          return HttpResponse.json(
            { data: null, status: 401, message: 'Unauthorized' },
            { status: 401 },
          );
        }),
      );

      await expect(getAddresses(TOKEN)).rejects.toThrow();
    });
  });

  describe('getAddressSearchList', () => {
    it('키워드 + 페이지 → 검색 결과 반환', async () => {
      const result = await getAddressSearchList('강남', 1);
      expect(result).toEqual(mockData.addressSearchResult);
    });
  });

  describe('getAddress', () => {
    it('단일 주소 조회 → 주소 상세 반환', async () => {
      const result = await getAddress(TOKEN, 1);
      expect(result).toEqual(mockData.addressDetail);
    });
  });

  describe('postAddress', () => {
    it('생성 성공 → 에러 없이 완료', async () => {
      await expect(postAddress(TOKEN, samplePayload)).resolves.toBeDefined();
    });
  });

  describe('putAddress', () => {
    it('수정 성공 → 에러 없이 완료', async () => {
      await expect(putAddress(TOKEN, '1', samplePayload)).resolves.toBeDefined();
    });
  });

  describe('deleteAddress', () => {
    it('삭제 성공 → 에러 없이 완료', async () => {
      await expect(deleteAddress(TOKEN, '1')).resolves.toBeDefined();
    });
  });

  describe('patchDefaultAddress', () => {
    it('기본 주소 설정 → 에러 없이 완료', async () => {
      await expect(patchDefaultAddress(TOKEN, '1')).resolves.toBeDefined();
    });
  });

  describe('getDefaultAddress', () => {
    it('기본 주소 조회 → Address 반환', async () => {
      const result = await getDefaultAddress(TOKEN);
      expect(result).toEqual(mockData.defaultAddress);
    });
  });
});
