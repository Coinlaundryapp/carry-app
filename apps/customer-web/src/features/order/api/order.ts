import type { Schemas } from '@carry/types';
import { newIdempotencyKey } from '@carry/api';
import { createV2Client } from '@shared/api/v2-client';
import {
  LaundryItemType,
  LaundryPriceData,
  OrderContent,
  OrderRequestType,
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

type V2Order = Schemas['OrderResponse'];
type V2SelectedOption = Schemas['SelectedOptionRequest'];

/**
 * v1의 분리된 옵션(washOption·dryOption·additionalOptions)을 v2 `selectedOptions`
 * (`{optionType, subOptionType}[]`)로 평탄화한다. optionType은 가격 정책과 동일한
 * WASH/DRY/ADDITIONAL 코드를 쓴다(백엔드는 @NotBlank 자유 문자열이라 거부는 없음).
 */
function buildSelectedOptions(content: OrderContent): V2SelectedOption[] {
  const options: V2SelectedOption[] = [];
  if (content.washOption) {
    options.push({ optionType: 'WASH', subOptionType: content.washOption });
  }
  if (content.dryOption) {
    options.push({ optionType: 'DRY', subOptionType: content.dryOption });
  }
  for (const additional of content.additionalOptions ?? []) {
    options.push({ optionType: 'ADDITIONAL', subOptionType: additional });
  }
  return options;
}

/**
 * 주문 생성 — v1 `POST /v1/orders` → v2 `POST /api/v2/orders`(createOrder).
 * **Idempotency-Key**를 붙여 멱등 생성한다(@carry/api request가 헤더 부착, 재시도 시
 * 동일 키로 백엔드가 중복 생성 억제 — #82 계열). 응답에서 화면은 `id`만 쓴다(상태 페이지 이동).
 *
 * ⚠️ v2 createOrder 계약엔 `orderUnitType`·`orderRequestType`·`laundrySpecs`가 없어 전송
 * 시 버려진다(후속 known-debt). 날짜는 v1 커스텀 포맷 → ISO date-time으로 전환.
 */
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
}): Promise<V2Order> {
  const client = createV2Client({ accessToken });
  try {
    return await client.request<V2Order>('/api/v2/orders', {
      method: 'POST',
      idempotencyKey: newIdempotencyKey(),
      body: {
        shippingAddressId: addressId,
        laundromatId,
        laundryItemType: orderContent.laundryItemType ?? '',
        selectedOptions: buildSelectedOptions(orderContent),
        desiredPickupAt: new Date(orderSchedule.desiredPickupDateTime).toISOString(),
        desiredDeliveryAt: new Date(orderSchedule.desiredDeliveryDateTime).toISOString(),
      },
    });
  } catch (error) {
    throw new Error('주문에 실패했습니다.');
  }
}
