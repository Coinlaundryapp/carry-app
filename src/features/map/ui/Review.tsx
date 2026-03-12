import React from 'react';
import UserIcon from './user-icon.svg';
import type { ReviewData } from '@features/map/types/map-type';
import { RateStaIcon } from '@assets/icons';

const Review = ({ data }: { data: ReviewData }) => {
  return (
    <div className="h-auto w-full border-t border-t-line-neutral py-[20px]">
      <div className="mb-2 flex gap-2">
        <UserIcon />
        <div className="flex flex-col items-start justify-center">
          <div className="font_caption_1">{data.userId}</div>
          <div className="font_caption_1 text-label-alternative">{data.content}</div>
        </div>
      </div>
      <div className="font_caption_2 mb-2 flex items-center justify-start gap-1.5">
        <div className="flex">
          <RateStaIcon />
          <RateStaIcon />
          <RateStaIcon />
          <RateStaIcon />
        </div>
        <div className="text-font_label_2 text-label-alternative">{data.day}</div>
      </div>
      <div className="font_label_2 text-start text-label-neutral">{data.text}</div>
    </div>
  );
};

export default Review;
