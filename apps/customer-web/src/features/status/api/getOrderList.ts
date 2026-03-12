import { ApiResponse, OrderListRes } from '@shared/types/api-types';
import { fetchExtended } from '@shared/api/api-client';

export const getOrderList = async (accessToken: string, orderId?: number) => {
  const res = await fetchExtended<ApiResponse<OrderListRes[]>>(
    `/api/v1/orders?cursor=${orderId}&size=10`,
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
