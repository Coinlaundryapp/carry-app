import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { mockData } from '@/test/mocks/handlers';
import { getPrices, postOrder } from './order';

describe('order API', () => {
  describe('getPrices', () => {
    it('쿼리 파라미터 정상 전달 + 응답 매핑', async () => {
      const result = await getPrices({
        orderUnitType: 'SOLO',
        orderRequestType: 'NEW',
        laundryItemType: 'REGULAR',
      });

      expect(result).toEqual(mockData.priceData);
    });

    it('에러 응답 → ApiError 발생', async () => {
      server.use(
        http.get('*/api/v1/prices', () => {
          return HttpResponse.json(
            { data: null, status: 500, message: 'Internal Server Error' },
            { status: 500 },
          );
        }),
      );

      await expect(
        getPrices({
          orderUnitType: 'SOLO',
          orderRequestType: 'NEW',
          laundryItemType: 'REGULAR',
        }),
      ).rejects.toThrow();
    });
  });

  describe('postOrder', () => {
    const orderParams = {
      accessToken: 'test-token',
      orderContent: {
        orderUnitType: 'SOLO' as const,
        orderRequestType: 'NEW' as const,
        laundryItemType: 'REGULAR' as const,
        laundrySpecs: [{ laundrySpec: 'LAUNDRY_COLOR', value: 1 }],
        washOption: 'STANDARD' as const,
        dryOption: 'LOW_HEAT' as const,
        additionalOptions: ['FOLD_LAUNDRY' as const],
      },
      laundromatId: 1,
      addressId: 1,
      orderSchedule: {
        desiredPickupDateTime: '2024-01-15T10:00:00',
        desiredDeliveryDateTime: '2024-01-16T18:00:00',
      },
    };

    it('정상 주문 생성 → OrderResponse 반환', async () => {
      const result = await postOrder(orderParams);
      expect(result).toEqual(mockData.orderResponse);
    });

    it('요청 본문에 LAUNDRY_WEIGHT spec 주입 + 날짜 포맷 변환', async () => {
      let capturedBody: Record<string, unknown> | null = null;

      server.use(
        http.post('*/api/v1/orders', async ({ request }) => {
          capturedBody = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json(
            { data: mockData.orderResponse, status: 201, message: 'created' },
            { status: 201 },
          );
        }),
      );

      await postOrder(orderParams);

      expect(capturedBody).not.toBeNull();
      const body = capturedBody as unknown as Record<string, unknown>;
      const content = body.orderContent as Record<string, unknown>;
      const specs = content.laundrySpecs as { laundrySpec: string; value: number }[];

      // LAUNDRY_WEIGHT spec이 주입되었는지 확인
      expect(specs).toContainEqual({ laundrySpec: 'LAUNDRY_WEIGHT', value: 5 });

      // 기존 spec도 유지되는지 확인
      expect(specs).toContainEqual({ laundrySpec: 'LAUNDRY_COLOR', value: 1 });

      // 날짜 포맷이 'yyyy-MM-dd HH:mm:ss EEE' 패턴인지 확인
      const schedule = body.orderSchedule as Record<string, string>;
      expect(schedule.desiredPickupDateTime).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} \w{3}$/);
      expect(schedule.desiredDeliveryDateTime).toMatch(
        /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} \w{3}$/,
      );
    });

    it('에러 시 "주문에 실패했습니다." 에러 발생', async () => {
      server.use(
        http.post('*/api/v1/orders', () => {
          return HttpResponse.json(
            { data: null, status: 500, message: 'Internal Server Error' },
            { status: 500 },
          );
        }),
      );

      await expect(postOrder(orderParams)).rejects.toThrow('주문에 실패했습니다.');
    });
  });
});
