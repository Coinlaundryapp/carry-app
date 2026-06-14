import { format } from 'date-fns';
import type { Schemas } from '@carry/types';
import { fetchExtended } from '@shared/api/api-client';
import { ApiResponse } from '@shared/types/api-types';
import { createV2Client } from '@shared/api/v2-client';
import {
  LaundryItemType,
  LaundryPriceData,
  OrderContent,
  OrderRequestType,
  OrderResponse,
  OrderSchedule,
  OrderUnitType,
} from '@features/order/types/laundry-type';

type V2PricePolicy = Schemas['PricePolicyResponse'];
type V2OptionPrice = Schemas['OptionPriceResponse'];
type OptionItem = { selectable: boolean; price: number | null };

const EMPTY_OPTION: OptionItem = { selectable: false, price: null };

/**
 * v2 가격 정책(`PricePolicyResponse.optionPrices` — 평면 리스트)을 화면이 쓰는 중첩
 * 구조 `LaundryPriceData`로 매핑한다(strangler/anti-corruption). subOptionType이
 * 화면 키와 1:1로 대응하므로 버킷팅한다. 누락 옵션은 `{selectable:false, price:null}`.
 */
function toLaundryPriceData(policy: V2PricePolicy): LaundryPriceData {
  const by = new Map<string, OptionItem>(
    (policy.optionPrices ?? []).map((o: V2OptionPrice) => [
      o.subOptionType,
      { selectable: o.selectable, price: o.price },
    ]),
  );
  const pick = (key: string) => by.get(key) ?? EMPTY_OPTION;
  return {
    washOption: {
      standard: pick('STANDARD'),
      hotWater: pick('HOT_WATER'),
    },
    dryOption: {
      lowHeat: pick('LOW_HEAT'),
      highHeat: pick('HIGH_HEAT'),
    },
    additionalOption: {
      foldLaundry: pick('FOLD_LAUNDRY'),
      addSoftener: pick('ADD_SOFTENER'),
    },
  };
}

export async function getPrices({
  orderUnitType,
  orderRequestType,
  laundryItemType,
}: {
  orderUnitType: OrderUnitType;
  orderRequestType: OrderRequestType;
  laundryItemType: LaundryItemType;
}): Promise<LaundryPriceData> {
  const queryParams = new URLSearchParams({
    orderUnitType,
    orderRequestType,
    laundryItemType,
  });
  const client = createV2Client();
  const data = await client.request<V2PricePolicy>(`/api/v2/prices?${queryParams.toString()}`, {
    method: 'GET',
    cache: 'no-cache',
  });
  return toLaundryPriceData(data);
}

export async function postOrder({
  accessToken,
  orderContent,
  laundromatId,
  addressId,
  orderSchedule,
}: {
  accessToken: string;
  orderContent: OrderContent;
  laundromatId: number;
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
              value: 5,
            },
          ],
          orderRequestType: orderContent.orderRequestType,
          orderUnitType: orderContent.orderUnitType,
          washOption: orderContent.washOption,
        },
        laundromatId,
        addressId,
        orderSchedule: {
          desiredPickupDateTime,
          desiredDeliveryDateTime,
        },
      },
    });

    return res.body.data;
  } catch (error) {
    throw new Error('주문에 실패했습니다.');
  }
}
