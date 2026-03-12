import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { mockData } from '@/test/mocks/handlers';
import { getOrderDetail } from './getOrderDetail';
import { getOrderList } from './getOrderList';

const TOKEN = 'test-access-token';

describe('status API', () => {
  describe('getOrderDetail', () => {
    it('주문 상세 정상 반환', async () => {
      const result = await getOrderDetail(TOKEN, 1);
      expect(result).toEqual(mockData.orderDetail);
    });

    it('존재하지 않는 주문 → ApiError 발생', async () => {
      server.use(
        http.get('*/api/v1/orders/:id/details', () => {
          return HttpResponse.json(
            { data: null, status: 404, message: 'Not Found' },
            { status: 404 },
          );
        }),
      );

      await expect(getOrderDetail(TOKEN, 9999)).rejects.toThrow();
    });
  });

  describe('getOrderList', () => {
    it('목록 조회 (cursor 없음)', async () => {
      const result = await getOrderList(TOKEN);
      expect(result).toEqual(mockData.orderList);
    });

    it('페이지네이션 (cursor 있음)', async () => {
      const nextPage = [
        {
          ...mockData.orderList[0],
          id: 2,
          laundromatName: '두번째 빨래방',
        },
      ];

      server.use(
        http.get('*/api/v1/orders', () => {
          return HttpResponse.json(
            { data: nextPage, status: 200, message: 'success' },
            { status: 200 },
          );
        }),
      );

      const result = await getOrderList(TOKEN, 1);
      expect(result).toEqual(nextPage);
      expect(result[0].id).toBe(2);
    });
  });
});
