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
} from './addressApi';
import type { AddressPayload } from '@features/address/types/address-type';

const TOKEN = 'test-access-token';

const samplePayload: AddressPayload = {
  addressLabel: '집',
  recipientPhone: '010-1234-5678',
  recipientName: '홍길동',
  baseAddress: '서울시 강남구 테헤란로 123',
  detailAddress: '101동 202호',
  deliveryNotes: '문 앞에 놓아주세요',
  entranceType: 'PASSWORD',
  entranceDetail: '1234',
  latitude: 37.5065,
  longitude: 127.0536,
  zipCode: '06234',
  areaCode: 'GANGNAM',
};

describe('addressApi (v2)', () => {
  describe('getAddresses', () => {
    it('v2 목록 → 앱 AddressListItem 형태로 매핑', async () => {
      const result = await getAddresses(TOKEN);
      expect(result).toEqual([
        {
          addressId: 1,
          addressLabel: '집',
          fullAddress: '서울시 강남구 테헤란로 123 101동 202호',
          isDefault: true,
        },
        {
          addressId: 2,
          addressLabel: '회사',
          // detailAddress가 비면 trim으로 도로명만 남는다.
          fullAddress: '서울시 서초구 서초대로 456',
          isDefault: false,
        },
      ]);
    });

    it('401 응답 → 에러 발생', async () => {
      server.use(
        http.get('*/api/v2/shipping-addresses', () =>
          HttpResponse.json(
            { status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' },
            { status: 401 },
          ),
        ),
      );
      await expect(getAddresses(TOKEN)).rejects.toThrow();
    });
  });

  describe('getAddressSearchList', () => {
    it('v2 geocode → content + 좌표/우편번호 동봉, 단일 페이지', async () => {
      const result = await getAddressSearchList('강남', 1);
      expect(result.pagination.hasNext).toBe(false);
      expect(result.content).toEqual([
        {
          addressName: '서울시 강남구 테헤란로 123',
          addressType: 'ROAD',
          regionAddress: { addressName: '서울시 강남구 역삼동 123-45' },
          roadAddress: '서울시 강남구 테헤란로 123',
          latitude: 37.5065,
          longitude: 127.0536,
          zipCode: '06234',
        },
      ]);
    });
  });

  describe('getAddress', () => {
    it('v2 상세 → TAddressRes 매핑(좌표/areaCode 라운드트립 보존)', async () => {
      const result = await getAddress(TOKEN, 1);
      expect(result).toMatchObject({
        id: 1,
        addressLabel: '집',
        baseAddress: '서울시 강남구 테헤란로 123',
        detailAddress: '101동 202호',
        recipientName: '홍길동',
        recipientPhone: '010-1234-5678',
        entranceDetail: '비밀번호 1234#',
        isDefaultAddress: true,
        latitude: 37.5065,
        longitude: 127.0536,
        zipCode: '06234',
        areaCode: 'GANGNAM',
      });
    });
  });

  describe('postAddress', () => {
    it('생성 성공 → v2 생성 요청 바디로 매핑 전송', async () => {
      let captured: Record<string, unknown> | null = null;
      server.use(
        http.post('*/api/v2/shipping-addresses', async ({ request }) => {
          captured = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json(
            { data: mockData.v2Address, status: 201, code: 'SUCCESS', message: 'created' },
            { status: 201 },
          );
        }),
      );

      await expect(postAddress(TOKEN, samplePayload)).resolves.toBeDefined();
      expect(captured).toEqual({
        alias: '집',
        roadAddress: '서울시 강남구 테헤란로 123',
        detailAddress: '101동 202호',
        zipCode: '06234',
        latitude: 37.5065,
        longitude: 127.0536,
        recipientName: '홍길동',
        recipientPhone: '010-1234-5678',
        entranceInfo: '1234',
        areaCode: 'GANGNAM',
      });
    });

    it('지오 필드 누락 시 기본값(areaCode=GANGNAM, zipCode=00000, 좌표 0)으로 보정', async () => {
      let captured: Record<string, unknown> | null = null;
      server.use(
        http.post('*/api/v2/shipping-addresses', async ({ request }) => {
          captured = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json(
            { data: mockData.v2Address, status: 201, code: 'SUCCESS', message: 'created' },
            { status: 201 },
          );
        }),
      );

      const bare: AddressPayload = {
        addressLabel: '집',
        recipientPhone: '010-1234-5678',
        recipientName: '홍길동',
        baseAddress: '서울시 강남구 테헤란로 123',
        detailAddress: '101동 202호',
        deliveryNotes: '',
        entranceType: '',
        entranceDetail: '',
      };
      await postAddress(TOKEN, bare);
      expect(captured).toMatchObject({
        areaCode: 'GANGNAM',
        zipCode: '00000',
        latitude: 0,
        longitude: 0,
        entranceInfo: null,
      });
    });
  });

  describe('putAddress', () => {
    it('수정 성공 → 에러 없이 완료', async () => {
      await expect(putAddress(TOKEN, '1', samplePayload)).resolves.toBeDefined();
    });
  });

  describe('deleteAddress', () => {
    it('삭제 성공(204) → 에러 없이 완료', async () => {
      await expect(deleteAddress(TOKEN, '1')).resolves.toBeUndefined();
    });
  });

  describe('patchDefaultAddress', () => {
    it('기본 배송지 설정(v2 PUT …/default) → 에러 없이 완료', async () => {
      await expect(patchDefaultAddress(TOKEN, '1')).resolves.toBeUndefined();
    });
  });
});
