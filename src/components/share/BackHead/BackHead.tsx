import { ArrowLeftIcon } from '@assets/icons';
import React from 'react';

type Props = {
  title: string;
};

function BackHead({ title }: Props) {
  return (
    <div className="sticky top-0 flex w-full justify-center p-2 text-center">
      <ArrowLeftIcon className="absolute left-2 top-2 text-xl font-bold" />
      <h1 className="text-xl font-bold">{title}</h1>
    </div>
  );
}

export default BackHead;
