import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { mockData } from '@/test/mocks/handlers';
import { getOrderDetail } from './getOrderDetail';
import { getOrderList } from './getOrderList';

const TOKEN = 'test-access-token';

describe('status API (v2)', () => {
  describe('getOrderDetail', () => {
    it('v2 OrderResponse → 앱 OrderDetailRes 매핑(화면 핵심 필드)', async () => {
      const result = await getOrderDetail(TOKEN, 1);
      const order = mockData.orderResponse;

      expect(result.id).toBe(order.id);
      expect(result.status).toBe(order.status);
      expect(result.orderShedule.desiredPickupDateTime).toBe(order.desiredPickupAt);
      expect(result.shippingAddress.baseAddress).toBe(order.roadAddress);
      expect(result.shippingAddress.recipientName).toBe(order.recipientName);
      // selectedOptions 역추출
      expect(result.orderContent.washOption).toBe('STANDARD');
      expect(result.orderContent.dryOption).toBe('LOW_HEAT');
      // v2 미보유 → degrade 기본값
      expect(result.laundromatName).toBe('');
      expect(result.orderContent.orderUnitType).toBe('SOLO');
      // 금액은 인보이스 조회로 이관(Task 8) — 주문 응답엔 더 이상 없음
      expect(result.paymentDetails.netAmount).toBe(0);
    });

    it('존재하지 않는 주문(404) → 에러 발생', async () => {
      server.use(
        http.get('*/api/v2/orders/:orderId', () =>
          HttpResponse.json(
            { status: 404, code: 'NOT_FOUND', message: 'Not Found' },
            { status: 404 },
          ),
        ),
      );
      await expect(getOrderDetail(TOKEN, 9999)).rejects.toThrow();
    });
  });

  describe('getOrderList', () => {
    it('v2 목록 → 앱 OrderListRes[] 매핑(id·status)', async () => {
      const result = await getOrderList(TOKEN);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockData.orderResponse.id);
      expect(result[0].status).toBe(mockData.orderResponse.status);
      expect(result[0].laundromatName).toBe('');
    });

    it('페이지네이션 (cursor 있음) → cursor 쿼리 전달', async () => {
      let capturedUrl = '';
      server.use(
        http.get('*/api/v2/orders/my', ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json(
            {
              data: [{ ...mockData.orderResponse, id: 2 }],
              status: 200,
              code: 'SUCCESS',
              message: 'success',
            },
            { status: 200 },
          );
        }),
      );

      const result = await getOrderList(TOKEN, 1);
      expect(result[0].id).toBe(2);
      expect(capturedUrl).toContain('cursor=1');
    });
  });
});
