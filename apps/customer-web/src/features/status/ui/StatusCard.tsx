import { cn } from '@shared/lib/utils';
import { cva } from 'class-variance-authority';
import Link from 'next/link';
import Seperate from '@assets/icons/separateWash.svg';
import Economic from '@assets/icons/economiWash.svg';
import InfoIcon from '@assets/icons/information-circle-red.svg';
import { OrderDetailRes, OrderListRes } from '@shared/types/api-types';
import { toDeliveryProgress, type PaymentBadge } from '@features/status/lib/status-mappers';

const DELIVERY_TOTAL_STEPS = 4;

const badgeStyle = cva('flex w-fit items-center justify-center rounded-xl px-[8px] py-[4px]', {
  variants: {
    tone: {
      success: 'bg-cyan-50 text-primary-normal',
      info: 'bg-fill-normal text-label-alternative',
      danger: 'bg-fill-normal text-[#FF4D4F]',
    },
  },
});

interface StatusCardProps {
  variant: 'list' | 'detail';
  orderStatus: string;
  paymentBadge?: PaymentBadge | null;
  info: OrderDetailRes | OrderListRes;
}

const StatusCard = ({ variant, orderStatus, paymentBadge: badge, info }: StatusCardProps) => {
  if (!info) return null;

  const progress = toDeliveryProgress(orderStatus);
  // list 화면은 인보이스를 조회하지 않으므로(N+1 회피) badge를 항상 무시한다.
  const shownBadge = variant === 'detail' ? badge : null;

  return (
    <div className="bg-background-normal border-line-neutral flex w-full flex-col justify-center gap-[20px] self-stretch rounded-lg border p-[20px]">
      <div className="flex flex-col items-start gap-[8px] self-stretch">
        {progress.cancelled ? (
          <div className={cn(badgeStyle({ tone: 'danger' }))}>
            <span className="font_label_2 font-semibold">취소</span>
          </div>
        ) : (
          <div className="flex flex-col gap-[8px] self-stretch">
            <div className="flex items-center gap-[4px] self-stretch">
              {Array.from({ length: DELIVERY_TOTAL_STEPS }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    'h-[4px] flex-1 rounded-full',
                    i < progress.step ? 'bg-primary-normal' : 'bg-fill-normal',
                  )}
                />
              ))}
            </div>
            <span className="font_label_2 text-primary-normal font-semibold">{progress.label}</span>
          </div>
        )}
        <p className="font_label_1_normal text-label-alternative">주문번호 {info.id}</p>
      </div>
      <div className="flex gap-[12px] self-stretch">
        <div className="flex h-[48px] w-[48px] items-center justify-center rounded-[10px] bg-[#F4F4F5] px-[6px] py-[8px]">
          {info.orderContent.orderUnitType === 'SOLO' && <Seperate width={'auto'} />}
          {info.orderContent.orderUnitType === 'ECONOMY' && <Economic width={'auto'} />}
        </div>
        <div className="flex flex-1 items-end justify-between">
          <div className="flex flex-col gap-[4px]">
            <span className="font_body_1_normal font-semibold">
              {info.orderContent.orderUnitType === 'SOLO' && '단독 세탁'}
              {info.orderContent.orderUnitType === 'ECONOMY' && '알뜰 세탁'}
              {info.orderContent.orderUnitType === 'TEAM' && ''}
            </span>
            <span className="font_label_1_normal text-label-alternative">
              {info.orderContent.laundryItemType === 'BLANKET' && '이불 세탁'}
              {info.orderContent.laundryItemType === 'REGULAR' && '일반 세탁'}
              {info.orderContent.laundryItemType === 'REGULAR_AND_BLANKET' && '일반 + 이불 세탁'}
              {info.orderContent.laundryItemType === 'SHOES' && '신발 세탁'}&nbsp;|&nbsp;
              {info.laundromatName}
            </span>
          </div>
          {shownBadge?.amount != null && (
            <span className="font_label_1_normal font-semibold">
              {shownBadge.amount.toLocaleString()}원
            </span>
          )}
        </div>
      </div>
      {shownBadge && (
        <div className={cn(badgeStyle({ tone: shownBadge.tone }))}>
          <span className="font_label_2 font-semibold">{shownBadge.label}</span>
        </div>
      )}
      {shownBadge?.needsAction && (
        <div className="flex items-center gap-[4px]">
          <InfoIcon width={16} height={16} />
          <p className="font_caption_1 text-label-alternative flex-1">카드 확인 필요</p>
          <Link href="/my/payment" className="font_caption_1 text-primary-normal font-semibold">
            카드 확인하기
          </Link>
        </div>
      )}
    </div>
  );
};

export default StatusCard;
