import { CarIcon, FramIcon } from '@assets/icons';
import React from 'react';

type TProps = {
  text?: string;
};

function Loading({ text }: TProps) {
  return (
    <div className="mx-auto flex h-dvh max-w-[480px] flex-col items-center justify-center gap-3 bg-white">
      <FramIcon />
      <CarIcon />
      <div className="flex flex-col items-center justify-center">
        <h2 className="font-headline-1 font-semibold">잠시만 기다려 주세요!</h2>
        <p className="text-label-alternative font-body-1-reading font-medium">
          {text ? text : '해당 페이지로 이동하고 있어요'}
        </p>
      </div>
    </div>
  );
}

export default Loading;
