import { cn } from '@shared/lib/utils';
import { LaundryStatusType } from '@features/status/types/laundry-status-type';
import { cva } from 'class-variance-authority';
import Seperate from '@assets/icons/separateWash.svg';
import Economic from '@assets/icons/economiWash.svg';
import InfoIcon from '@assets/icons/information-circle-red.svg';
import { OrderDetailRes, OrderListRes } from '@shared/types/api-types';

const statusBadge = cva(
  'flex items-center justify-center rounded-xl bg-primary px-[8px] py-[4px]',
  {
    variants: {
      status: {
        ORDER_COMPLETED: 'bg-cyan-50 text-primary-normal',
        ORDER_CANCELED: 'bg-fill-normal text-[#FF4D4F]',
        PAYMENT_PENDING: '',
        PAYMENT_COMPLETED: 'bg-cyan-50 text-primary-normal',
        DELIVERY_COMPLETED: '',
        REFUND_PENDING: 'bg-fill-normal text-[#FF4D4F]',
        REFUND_REQUEST_CANCELED: 'bg-fill-normal text-[#FF4D4F]',
        REFUND_COMPLETED: '',
      },
    },
  },
);

interface StatusCardProps {
  status: LaundryStatusType | undefined;
  info: OrderDetailRes | OrderListRes;
  hasButton: boolean;
}

const StatusCard = ({ status, info, hasButton }: StatusCardProps) => {
  if (!info) return null;

  return (
    <div className="bg-background-normal flex w-full flex-col justify-center gap-[20px] self-stretch rounded-lg border border-line-neutral p-[20px]">
      <div className="flex flex-col items-start gap-[8px]">
        <div className={cn(statusBadge({ status }))}>
          <span className="font_label_2 font-semibold">
            {status === 'PAYMENT_COMPLETED' && '결제 완료'}
            {status === 'ORDER_COMPLETED' && '신청 완료'}
            {status === 'ORDER_CANCELED' && '주문 취소'}
            {status === 'REFUND_PENDING' && '환불 대기'}
            {status === 'REFUND_REQUEST_CANCELED' && '환불 요청 취소'}
          </span>
        </div>
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
          <span className="font_label_1_normal font-semibold">{}원</span>
        </div>
      </div>
      {status === 'ORDER_CANCELED' && (
        <div className="flex gap-[4px]">
          <InfoIcon width={16} height={16} />
          <p className="font_caption_1 flex-1 text-label-alternative">
            카드사에서 8/9(금) 이내 환불 완료 예정입니다.
          </p>
        </div>
      )}
      {hasButton && <>{status === 'ORDER_COMPLETED' && <></>}</>}
    </div>
  );
};

export default StatusCard;
