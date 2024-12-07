'use client';
import Rating from '@/components/my/Rating';
import ReviewCard from '@/components/my/ReviewCard';
import ReviewTextarea from '@/components/my/ReviewTextarea';
import Button from '@/components/share/Button/Button';
import Separator from '@/components/share/Separator/Separator';
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
