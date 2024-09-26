'use client';
import { RateStaIcon } from '@assets/icons';
import { NoCoinList } from '@assets/icons';
import { KINDS_STATUS } from '@/constants/map';
import Image from 'next/image';

type Props = {
  data: any;
  onSelectedAddress: (addressId: string) => void;
};

function CoinlaundryDefault({ data, onSelectedAddress }: Props) {
  if (data && data.length === 0) {
    return (
      <div className={`flex h-[46vh] items-center justify-center`}>
        <NoCoinList />
      </div>
    );
  }
  return (
    <div
      className={`overflow-y-auto ${data && data.length > 2 ? 'h-[50vh] max-h-[50vh]' : 'max-h-auto'}`}
    >
      {data &&
        data.map((item: any) => {
          return (
            <div
              onClick={() => onSelectedAddress(item.id)}
              key={item.id}
              className="mb-4.5 mx-5 mt-2 border-b border-line-normal"
            >
              <div className="flex justify-between">
                <div className="mb-2 flex items-center justify-start gap-2">
                  <h3 className="font_headline_2">
                    {item.name.length > 8 ? `${item.name.slice(0, 10)}...` : item.name}
                  </h3>
                  <div className="font_caption_1 text-label-alternative">
                    {Math.round(item.distance)}km
                  </div>
                </div>
                <div className="flex gap-1">
                  {item.options.map((option: string) => {
                    const optionsStatus = KINDS_STATUS.find((status) => status.id === option);

                    if (!optionsStatus) return null;

                    return (
                      <div key={option}>
                        <optionsStatus.component />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <div className="flex items-center gap-1">
                  <RateStaIcon />
                  <span className="font_label_2 text-label-neutral">
                    {item.reviewAverageRating.toFixed(1)}
                  </span>
                </div>
                <span className="font_label_2 text-label-neutral"> • 리뷰{item.reviewCount}개</span>
              </div>

              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="font_caption_1 text-primary-normal">
                      {item.type === '0' ? '단독 세탁' : '세탁'}
                    </span>
                    <div className="font_label_1_normal">배송비 {item.individualDeliveryFee}원</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font_caption_1 text-base-blue-6">팀 세탁시</span>
                    <div className="font_label_1_normal">배송비 {item.groupDeliveryFee}원</div>
                  </div>
                </div>

                {item.mediaResources.length !== 0 && (
                  <div className="relative">
                    <Image
                      className="rounded-sm"
                      alt={'Image description'}
                      src={item.mediaResources[0]?.mediaUrl}
                      width={60}
                      height={60}
                    />
                    <div className="absolute bottom-1 right-1 flex h-4 w-2 items-center justify-center rounded-sm bg-[#171719] bg-opacity-50 p-2">
                      <span className="text-sm text-white">{item.mediaResources.length}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
    </div>
  );
}

export default CoinlaundryDefault;
