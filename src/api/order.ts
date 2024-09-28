import { format } from 'date-fns';
import { fetchExtended } from '@/api/api-client';
import { ApiResponse } from '@/types/api-types';
import {
  LaundryItemType,
  LaundryPriceData,
  OrderContent,
  OrderRequestType,
  OrderResponse,
  OrderSchedule,
  OrderUnitType,
} from '@/types/laundry-type';

export async function getPrices({
  orderUnitType,
  orderRequestType,
  laundryItemType,
}: {
  orderUnitType: OrderUnitType;
  orderRequestType: OrderRequestType;
  laundryItemType: LaundryItemType;
}) {
  const queryParams = new URLSearchParams({
    orderUnitType,
    orderRequestType,
    laundryItemType,
  });
  const res = await fetchExtended<ApiResponse<LaundryPriceData>>(
    `/api/v1/prices?${queryParams.toString()}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-cache',
    },
  );
  const data = res.body.data;
  return data;
}

export async function postOrder({
  accessToken,
  orderContent,
  laundryromatId,
  addressId,
  orderSchedule,
}: {
  accessToken: string;
  orderContent: OrderContent;
  laundryromatId: number;
  addressId: number;
  orderSchedule: OrderSchedule;
}) {
  const desiredPickupDateTime = format(
    orderSchedule.desiredPickupDateTime,
    'yyyy-MM-dd HH:mm:ss EEE',
  );
  const desiredDeliveryDateTime = format(
    orderSchedule.desiredDeliveryDateTime,
    'yyyy-MM-dd HH:mm:ss EEE',
  );
  try {
    const res = await fetchExtended<ApiResponse<OrderResponse>>(`/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: {
        orderContent: {
          additionalOptions: orderContent.additionalOptions,
          dryOption: orderContent.dryOption,
          laundryItemType: orderContent.laundryItemType,
          laundrySpecs: [
            ...orderContent.laundrySpecs,
            {
              laundrySpec: 'LAUNDRY_WEIGHT',
              value: orderContent.laundrySpecs[0].value,
            },
          ],
          orderRequestType: orderContent.orderRequestType,
          orderUnitType: orderContent.orderUnitType,
          washOption: orderContent.washOption,
        },
        laundromatId: laundryromatId,
        addressId,
        orderSchedule: {
          desiredPickupDateTime,
          desiredDeliveryDateTime,
        },
      },
    });
    return res.body.data;
  } catch (error) {
    throw new Error('주문을 완료하지 못했습니다.');
  }
}
