import { format, parse } from 'date-fns';
import { fetchExtended } from '@/api/api-client';
import { ApiResponse } from '@/types/api-types';
import {
  LaundryItemType,
  LaundryPriceData,
  LaundryPriceResponse,
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
  // const res = await fetchExtended<ApiResponse<LaundryPriceResponse>>(
  //   `/api/v1/prices?${queryParams.toString()}`,
  //   {
  //     method: 'GET',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //   },
  // );
  const data: LaundryPriceData = {
    washOption: {
      standard: {
        selectable: true,
        price: 4500,
      },
      hotWater: {
        selectable: true,
        price: 5000,
      },
    },
    dryOption: {
      lowHeat: {
        selectable: true,
        price: 4000,
      },
      highHeat: {
        selectable: true,
        price: 4000,
      },
    },
    additionalOption: {
      foldLaundry: {
        selectable: true,
        price: 1000,
      },
      addSoftener: {
        selectable: true,
        price: 0,
      },
    },
  };
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
    // const res = await fetchExtended<ApiResponse<OrderResponse>>(`/api/v1/orders`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     Authorization: `Bearer ${accessToken}`,
    //   },
    //   body: {
    //     orderContent,
    //     laundryromatId,
    //     addressId,
    //     orderSchedule: {
    //       desiredPickupDateTime,
    //       desiredDeliveryDateTime,
    //     },
    //   },
    // });
    // return res.body.data;
    const data = {
      id: 54, // orderId, 주문 번호
      status: 'ORDER_COMPLETED', // [Enum] 주문 명세서 상태
      orderUnitType: 'SOLO',
      orderRequestType: 'NEW',
      laundryItemType: 'REGULAR',
      laundromatName: '하늘이 세탁소',
      orderedAt: '2024-09-23T14:35:20Z',
      estimatedAmount: 14000,
    };
    return data;
  } catch (error) {
    throw new Error('주문을 완료하지 못했습니다.');
  }
}
