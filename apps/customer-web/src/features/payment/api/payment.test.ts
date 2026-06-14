import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { getPaymentInfo, postConfirmPayment } from './payment';

const TOKEN = 'test-access-token';

describe('payment API', () => {
  describe('getPaymentInfo (v2 invoice)', () => {
    it('v2 InvoiceResponse → PaymentInfo 매핑(요금 유형 버킷팅)', async () => {
      const result = await getPaymentInfo({ orderId: 1, accessToken: TOKEN });

      expect(result).toEqual({
        id: 1, // invoice.orderId
        orderedAt: '2024-09-23T14:35:20Z', // invoice.createdAt
        confirmedPayment: {
          discounts: { laundryDiscounts: [], deliveryDiscounts: [] },
          charges: {
            laundryPrice: 10500,
            deliveryFee: 4000,
            serviceFee: 1050,
          },
          netAmount: 15550, // invoice.totalAmount
        },
      });
    });

    it('특정 요금 유형 누락 → 해당 charge 0', async () => {
      server.use(
        http.get('*/api/v2/payments/:orderId/invoice', () =>
          HttpResponse.json(
            {
              data: {
                id: 11,
                orderId: 2,
                customerId: 100,
                status: 'ISSUED',
                lineItems: [{ chargeType: 'LAUNDRY_PRICE', description: '세탁', amount: 8000 }],
                weight: 3,
                totalAmount: 8000,
                createdAt: '2024-10-01T09:00:00Z',
              },
              status: 200,
              code: 'SUCCESS',
              message: 'success',
            },
            { status: 200 },
          ),
        ),
      );

      const result = await getPaymentInfo({ orderId: 2, accessToken: TOKEN });
      expect(result.confirmedPayment.charges).toEqual({
        laundryPrice: 8000,
        deliveryFee: 0,
        serviceFee: 0,
      });
    });

    it('404 → 에러 발생', async () => {
      server.use(
        http.get('*/api/v2/payments/:orderId/invoice', () =>
          HttpResponse.json(
            { status: 404, code: 'NOT_FOUND', message: 'invoice not found' },
            { status: 404 },
          ),
        ),
      );
      await expect(getPaymentInfo({ orderId: 99, accessToken: TOKEN })).rejects.toThrow();
    });
  });

  describe('postConfirmPayment (보류 — 목 유지)', () => {
    it('실 Toss PG 키 부재로 목 응답 반환(콘솔 준비 시 v2 배선)', async () => {
      const result = await postConfirmPayment({
        accessToken: TOKEN,
        orderId: 1,
        paymentKey: 'toss_payment_key_xyz',
        amount: 15550,
      });
      expect(result).toMatchObject({
        id: 1,
        status: 'PAYMENT_COMPLETED',
        confirmedAmount: 15550,
      });
    });
  });
});
