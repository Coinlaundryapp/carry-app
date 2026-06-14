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
        http.get('*/api/v2/prices', () => {
          return HttpResponse.json(
            { status: 500, code: 'INTERNAL_ERROR', message: 'Internal Server Error' },
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

    it('일부 옵션만 온 정책 → 누락 옵션은 {selectable:false, price:null}', async () => {
      server.use(
        http.get('*/api/v2/prices', () =>
          HttpResponse.json(
            {
              data: {
                id: 2,
                orderUnitType: 'SOLO',
                orderRequestType: 'NEW',
                laundryItemType: 'REGULAR',
                optionPrices: [
                  { optionType: 'WASH', subOptionType: 'STANDARD', price: 4000, selectable: true },
                ],
              },
              status: 200,
              code: 'SUCCESS',
              message: 'success',
            },
            { status: 200 },
          ),
        ),
      );

      const result = await getPrices({
        orderUnitType: 'SOLO',
        orderRequestType: 'NEW',
        laundryItemType: 'REGULAR',
      });

      expect(result.washOption.standard).toEqual({ selectable: true, price: 4000 });
      expect(result.washOption.hotWater).toEqual({ selectable: false, price: null });
      expect(result.dryOption.lowHeat).toEqual({ selectable: false, price: null });
      expect(result.additionalOption.addSoftener).toEqual({ selectable: false, price: null });
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

    it('정상 주문 생성 → v2 OrderResponse 반환(화면은 id 사용)', async () => {
      const result = await postOrder(orderParams);
      expect(result).toEqual(mockData.orderResponse);
      expect(result.id).toBe(1);
    });

    it('v2 요청 본문 매핑 + Idempotency-Key 헤더', async () => {
      let capturedBody: Record<string, unknown> | null = null;
      let idempotencyKey: string | null = null;

      server.use(
        http.post('*/api/v2/orders', async ({ request }) => {
          capturedBody = (await request.json()) as Record<string, unknown>;
          idempotencyKey = request.headers.get('Idempotency-Key');
          return HttpResponse.json(
            { data: mockData.orderResponse, status: 201, code: 'SUCCESS', message: 'created' },
            { status: 201 },
          );
        }),
      );

      await postOrder(orderParams);

      const body = capturedBody as unknown as Record<string, unknown>;
      // v1 분리 옵션 → v2 selectedOptions 평탄화
      expect(body.selectedOptions).toEqual([
        { optionType: 'WASH', subOptionType: 'STANDARD' },
        { optionType: 'DRY', subOptionType: 'LOW_HEAT' },
        { optionType: 'ADDITIONAL', subOptionType: 'FOLD_LAUNDRY' },
      ]);
      expect(body.shippingAddressId).toBe(1);
      expect(body.laundromatId).toBe(1);
      expect(body.laundryItemType).toBe('REGULAR');
      // 날짜는 ISO date-time
      expect(body.desiredPickupAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      // v2 계약에 없는 필드는 전송 안 함
      expect(body.orderContent).toBeUndefined();
      expect(body.orderUnitType).toBeUndefined();
      // 멱등 키 부착
      expect(idempotencyKey).toBeTruthy();
    });

    it('에러 시 "주문에 실패했습니다." 에러 발생', async () => {
      server.use(
        http.post('*/api/v2/orders', () => {
          return HttpResponse.json(
            { status: 500, code: 'INTERNAL_ERROR', message: 'Internal Server Error' },
            { status: 500 },
          );
        }),
      );

      await expect(postOrder(orderParams)).rejects.toThrow('주문에 실패했습니다.');
    });
  });
});
