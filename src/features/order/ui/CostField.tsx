import DeliveryCostInfoDialog from '@features/order/ui/DeliveryCostInfoDialog';
import Separator from '@shared/ui/Separator/Separator';
import { BASE_COST, BASE_DISTANCE, COST_INCREMENT, DISTANCE_INCREMENT } from '@features/order/lib/policy';
import useOrderStore from '@features/order/model/order-store';
import { TAddressRes } from '@shared/types/api-types';
import { TLaundromats } from '@features/map/types/map-type';
import { formatNumberWithCommas } from '@shared/lib/format';

function getDeliveryCost(distance: number) {
  if (distance <= BASE_DISTANCE) {
    return BASE_COST;
  }
  return BASE_COST + Math.floor(distance / DISTANCE_INCREMENT) * COST_INCREMENT;
}

export default function CostField({
  address,
  laundromat,
}: Readonly<{
  address: TAddressRes | undefined;
  laundromat: TLaundromats | null;
}>) {
  const { totalAmount } = useOrderStore();
  if (!address || !laundromat) {
    return null;
  }
  const deliveryCost = getDeliveryCost(laundromat.distance);
  // 예상 결제 금액
  const predictedCost =
    laundromat.distance <= BASE_DISTANCE ? BASE_DISTANCE + totalAmount : deliveryCost + totalAmount;
  return (
    <>
      <section className="p-5">
        <h2 className="font-semibold text-label-strong font-headline-1">결제 금액</h2>
        <div className="mt-6 flex flex-col">
          <div className="flex items-center justify-between font-semibold text-label-normal font-body-1-reading">
            <div className="flex items-center gap-1">
              <p>배송비</p>
              <DeliveryCostInfoDialog distance={laundromat.distance} />
            </div>
            <p>{formatNumberWithCommas(deliveryCost)}원</p>
          </div>
          <div className="mt-2 flex justify-between font-medium text-label-alternative font-label-1-normal">
            <p>ㄴ 할인금액</p>
            <p className="font-semibold">0원</p>
          </div>
          <Separator variant="horizontal" className="my-5" />
          <div className="flex items-center justify-between font-semibold">
            <p className="text-label-strong font-body-2-normal">예상 결제 금액</p>
            <p className="text-primary-normal font-heading-2">
              {formatNumberWithCommas(predictedCost - 1000)}~
              {formatNumberWithCommas(predictedCost + 1000)}원
            </p>
          </div>
        </div>
      </section>
      <Separator variant="horizontal8" />
    </>
  );
}
