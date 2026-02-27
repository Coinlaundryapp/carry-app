'use client';

import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cva } from 'class-variance-authority';

const colorVariants = cva('h-full w-full flex-1 transition-all', {
  variants: {
    color: {
      default: 'bg-primary-normal',
      blue: 'bg-base-blue-6',
    },
  },
});

export default function ProgressBar({
  percent,
  color = 'default',
}: {
  percent: number;
  color?: 'default' | 'blue';
}) {
  return (
    <ProgressPrimitive.Root
      className="relative h-2 w-full overflow-hidden rounded-md bg-label-disable"
      value={percent}
    >
      <ProgressPrimitive.Indicator
        className={colorVariants({ color })}
        style={{ transform: `translateX(-${100 - (percent || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}
