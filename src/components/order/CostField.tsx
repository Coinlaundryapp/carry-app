import DeliveryCostInfoDialog from '@/components/order/DeliveryCostInfoDialog';
import Separator from '@/components/share/Separator/Separator';

export default function CostField() {
  return (
    <section className="p-5">
      <h2 className="font-semibold text-label-strong font-headline-1">결제 금액</h2>
      <div className="mt-6 flex flex-col">
        <div className="flex items-center justify-between font-semibold text-label-normal font-body-1-reading">
          <div className="flex items-center gap-1">
            <p>배송비</p>
            <DeliveryCostInfoDialog />
          </div>
          <p>4,000원</p>
        </div>
        <div className="mt-2 flex justify-between font-medium text-label-alternative font-label-1-normal">
          <p>ㄴ 할인금액</p>
          <p className="font-semibold">0원</p>
        </div>
        <Separator variant="horizontal" className="my-5" />
        <div className="flex items-center justify-between font-semibold">
          <p className="text-label-strong font-body-2-normal">예상 결제 금액</p>
          <p className="text-primary-normal font-heading-2">12,000~14,000원</p>
        </div>
      </div>
    </section>
  );
}
