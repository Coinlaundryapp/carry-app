import { fetchExtended } from '@/api/api-client';
import { ApiResponse } from '@/types/api-types';
import {
  LaundryItemType,
  LaundryPriceData,
  LaundryPriceResponse,
  OrderContent,
  OrderRequestType,
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

export async function postOrder(
  accessToken: string,
  orderContent: OrderContent,
  laundromatId: number,
  addressId: number,
  orderSchedule: {
    desiredPickupDateTime: string;
    desiredDeliveryDateTime: string;
  },
) {
  const res = await fetchExtended(`/api/v1/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: {
      orderContent,
      laundromatId,
      addressId,
      orderSchedule,
    },
  });

  const data = res;
  return data;
}
