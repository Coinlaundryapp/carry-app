import { cn } from '@shared/lib/utils';
import { cva } from 'class-variance-authority';

const separatorVariants = cva('', {
  variants: {
    variant: {
      horizontal8: 'w-full h-2 bg-background-normal-alternative',
      horizontal: 'w-full h-[1px] bg-line-normal',
      vertical: 'w-[1px] h-[32px] bg-line-normal',
    },
  },
});

export default function Separator({
  variant = 'horizontal',
  className,
}: {
  variant: 'horizontal' | 'vertical' | 'horizontal8';
  className?: string;
}) {
  return (
    <div
      className={cn(
        separatorVariants({
          variant,
        }),
        className,
      )}
    />
  );
}
