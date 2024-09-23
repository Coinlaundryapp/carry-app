'use client';

import Image from 'next/image';
import { useState } from 'react';
import Tag from '@/components/share/Tag';
import Button from '@/components/share/Button';
import ProgressBar from '@/components/share/ProgressBar';
import Separator from '@/components/share/Separator/Separator';
import { MinusIcon, PlusIcon, WarnHot, WarnWaterWashIcon } from '@assets/icons';

export function ShoeCountSelection({ onSelect }: Readonly<{ onSelect: (count: number) => void }>) {
  const [count, setCount] = useState(1);
  const handleIncreaseClick = () => {
    if (count < 6) {
      setCount(count + 1);
    }
  };
  const handleDecreaseClick = () => {
    if (count > 1) {
      setCount(count - 1);
    }
  };

  return (
    <div className="flex flex-col pb-6">
      <div className="mb-10 ml-2">
        <h2 className="mb-2.5 font-semibold text-label-strong font-heading-2">
          몇 켤레 세탁을 원하시나요?
        </h2>
      </div>
      <div className="mb-8 rounded-md bg-background-normal-alternative py-6">
        <div className="flex flex-col items-center px-[15px]">
          <h3 className="font-body-1-norma mb-5 font-semibold text-label-strong">
            <span className="text-base-blue-6">신발 세탁기</span> 한 대 기준 적정량
          </h3>
          <Image
            src="/assets/images/shoe-washer.png"
            width={252}
            height={48}
            alt="shoe-washer-image"
            className="mb-1"
            priority
          />
          <Tag color="black" label="운동화 최대 6켤레" className="mb-5" />
          <Separator variant="horizontal" className="mb-5" />
          <div className="flex w-full flex-col">
            <p className="mb-3 font-semibold text-label-normal font-body-2-normal">
              이런 운동화는 추천하지 않아요
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <WarnWaterWashIcon />
                <p className="font-semibold text-label-neutral font-label-2">
                  <span className="text-primary-normal">물빠짐</span> 우려가 있는 소재
                </p>
              </div>
              <div className="flex items-center gap-1">
                <WarnHot />
                <p className="font-semibold text-label-neutral font-label-2">
                  <span className="text-primary-normal">열에 약한</span> 소재
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mb-[35px] px-4">
        <div className="mb-5 flex justify-between">
          <button onClick={handleDecreaseClick}>
            <MinusIcon />
          </button>
          <span className="font-bold text-label-alternative font-title-1">
            <span className="text-base-blue-6">{count}</span> 켤레
          </span>
          <button onClick={handleIncreaseClick} className="text-2xl">
            <PlusIcon />
          </button>
        </div>
        <div className="mb-[22px]">
          <ProgressBar percent={((count - 1) / 5) * 100} color="blue" />
        </div>
        <div className="flex justify-between font-semibold text-label-alternative font-body-2-reading">
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
          <span>6</span>
        </div>
      </div>

      <Button state="fillPrimary" size="full" onClick={() => onSelect(count)}>
        확인
      </Button>
    </div>
  );
}
