import { ApiResponse, OrderDetailRes } from '@/types/api-types';
import { fetchExtended } from './api-client';

export const getOrderDetail = async (accessToken: string, orderId: number) => {
  const res = await fetchExtended<ApiResponse<OrderDetailRes>>(
    `/api/v1/orders/${orderId}/details`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  const data = res.body.data;
  return data;
};
