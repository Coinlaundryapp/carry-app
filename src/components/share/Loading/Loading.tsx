import { CarIcon, FramIcon } from '@assets/icons';
import React from 'react';

type TProps = {
  text?: string;
};

function Loading({ text }: TProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <FramIcon />
      <CarIcon />
      <h2 className=".font_label_2 font-bold">잠시만 기다려 주세요!</h2>
      <div>{text ? text : '다음 페이지로 이동중입니다.'}</div>
    </div>
  );
}

export default Loading;
