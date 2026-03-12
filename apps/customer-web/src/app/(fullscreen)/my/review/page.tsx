'use client';
import Rating from '@features/review/ui/Rating';
import ReviewCard from '@features/review/ui/ReviewCard';
import ReviewTextarea from '@features/review/ui/ReviewTextarea';
import Button from '@shared/ui/Button/Button';
import Separator from '@shared/ui/Separator/Separator';
import { CameraIcon } from '@assets/icons';

import React from 'react';

function Page() {
  const handleCameraClick = () => {};
  return (
    <div>
      <ReviewCard />
      <Separator variant="horizontal8" />
      <div className="flex justify-center py-6">
        <Rating rating={3.5} />
      </div>
      <div className="px-5 pb-6">
        <Button state="primary" size="full" onClick={handleCameraClick}>
          <span className="flex items-center justify-center gap-[4.5px] text-center">
            <CameraIcon />
            사진 올리기
          </span>
        </Button>
      </div>
      <div className="px-5">
        <ReviewTextarea />
      </div>
    </div>
  );
}

export default Page;
