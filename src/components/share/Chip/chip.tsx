import React, { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

type Props = {
  isActive: boolean;
  onClick: VoidFunction;
  text: string;
};

const ChipVariants = cva(
  `rounded-xl border-[1px] font-caption-1 px-[10px] py-[6px] whitespace-pre`,
  {
    variants: {
      variant: {
        active: 'border-primary-normal bg-primary-normal text-static-white',
        inactive: 'border-label-disable bg-static-white text-label-neutral',
      },
    },
    defaultVariants: {
      variant: 'inactive',
    },
  },
);

function Chip({ isActive, text, onClick }: Props, ref: React.Ref<HTMLButtonElement>) {
  return (
    <button
      className={cn(ChipVariants({ variant: isActive ? 'active' : 'inactive' }))}
      onClick={onClick}
      ref={ref}
    >
      {text || ' '}
    </button>
  );
}

export default forwardRef(Chip);
