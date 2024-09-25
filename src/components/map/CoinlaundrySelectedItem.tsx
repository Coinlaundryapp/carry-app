import { RateStaIcon } from '@assets/icons';
import Image from 'next/image';
import Tag from '../share/Tag/Tag';
import { KINDS_STATUS } from '@/constants/map';
import MyImageComponent from '../share/ImageComponent';

type Props = {
  data: any;

  type?: 'map' | 'order';
};

const dummyImages = new Array(3).fill('./Rectangle 1946.svg');

function CoinlaundrySelectedItem({ data, type = 'map' }: Props) {
  return (
    <div className="overflow-y-auto">
      <div key={data.id} className="mx-5 mt-4">
        <div className="flex justify-between">
          <div className="mb-2 flex items-center justify-start gap-2">
            <h3 className="font_headline_2">{data.name}</h3>
            <div className="font_caption_1 text-label-alternative">
              {Math.round(data.distance)}km
            </div>
          </div>
          <div className="flex gap-1">
            {data.options.map((option: string) => {
              const optionstatus = KINDS_STATUS.find((status) => status.id === option);

              if (!optionstatus) return null;

              return (
                <div key={option}>
                  <Tag
                    className="font_caption_1"
                    label={optionstatus.text}
                    color={optionstatus.color}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="mb-1 flex items-center gap-1">
          <div className="flex items-center gap-1">
            <RateStaIcon />
            <span className="font_label_2 text-label-neutral">{data.reviewAverageRating}</span>
          </div>
          <span className="font_label_2 text-label-neutral"> • 리뷰{data.reviewCount}개</span>
        </div>

        <div className="mb-4 flex flex-col items-start justify-between gap-5">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="font_caption_1 text-primary-normal">
                {data.type === '0' ? '단독 세탁' : '세탁'}
              </span>
              <div className="font_label_1_normal">배송비 6000원</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font_caption_1 text-base-blue-6">팀 세탁시</span>
              <div className="font_label_1_normal">배송비 6000원</div>
            </div>
          </div>

          <div className="b flex w-full justify-between">
            {dummyImages.map((src, index) => (
              <div
                key={index}
                className="flex-shrink-0 cursor-pointer"
                style={{ width: 'calc(33.33% - 8px)' }}
              >
                {data.length !== 0 && (
                  // <MyImageComponent imageUrl={data.mediaResources[0]?.mediaUrl} />
                  <Image
                    className="rounded-sm"
                    alt={'Image description'}
                    src={data.mediaResources[0]?.mediaUrl}
                    width={112}
                    height={96}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CoinlaundrySelectedItem;
