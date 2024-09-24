'use client';
import { RateStaIcon } from '@assets/icons';
import { NoCoinList } from '@assets/icons';
import Tag from '../share/Tag/Tag';
import clax from 'clsx';
import { KINDS_STATUS } from '@/constants/map';
import Image from 'next/image';

type Props = {
  data: any;

  type?: 'map' | 'order';
};

function CoinlaundryDefault({ data, type = 'map' }: Props) {
  if (data && data.length === 0) {
    return (
      <div className={`flex h-[46vh] items-center justify-center`}>
        <NoCoinList />
      </div>
    );
  }
  return (
    <div
      className={`overflow-y-auto ${data && data.length > 2 ? 'h-[53vh] max-h-[53vh] overflow-y-auto' : 'max-h-auto'}`}
    >
      {data &&
        data.map((item: any) => {
          // console.log('hihihih', item.mediaResources[0].mediaUrl);
          return (
            <div key={item.id} className="mb-4.5 mx-5 mt-4 border-b border-line-normal">
              <div className="flex justify-between">
                <div className="mb-2 flex items-center justify-start gap-2">
                  <h3 className="font_headline_2">{item.name}</h3>
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
                        <Tag
                          className="font_caption_1"
                          label={optionsStatus.text}
                          color={optionsStatus.color}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mb-1 flex items-center gap-1">
                <div className="flex items-center gap-1">
                  <RateStaIcon />
                  <span className="font_label_2 text-label-neutral">
                    {item.reviewAverageRating}
                  </span>
                </div>
                <span className="font_label_2 text-label-neutral"> • 리뷰{item.reviewCount}개</span>
              </div>

              <div
                className={clax(
                  'mb-4 flex justify-between',
                  type === 'map' ? 'items-center' : 'flex-col items-start gap-5',
                )}
              >
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="font_caption_1 text-primary-normal">
                      {item.type === '0' ? '단독 세탁' : '세탁'}
                    </span>
                    <div className="font_label_1_normal">배송비 {item.delivery}원</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font_caption_1 text-base-blue-6">팀 세탁시</span>
                    <div className="font_label_1_normal">배송비 {item.delivery}원</div>
                  </div>
                </div>
                <img src="https://github.com/user-attachments/assets/2a9ed189-74a7-48aa-a9a3-39aaf8f270a5" />
                {/* <img alt="" src={item.mediaResources[0]?.mediaUrl} /> */}
              </div>
            </div>
          );
        })}
    </div>
  );
}

export default CoinlaundryDefault;
