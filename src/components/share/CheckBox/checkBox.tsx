import React, { useId } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

type Props = {
  checked: boolean;
  onClick: VoidFunction;
  label?: string;
};

const CheckBoxVariants = cva(
  `appearance-none w-[18px] h-[18px] border-[1.5px] rounded-[3px] cursor-pointer`,
  {
    variants: {
      variant: {
        active:
          "bg-no-repeat bg-center checked:bg-[url('/image/check.svg')] border-primary-normal bg-primary-normal",
        inactive: 'border-label-assistive bg-static-white',
      },
    },
    defaultVariants: {
      variant: 'inactive',
    },
  },
);

export function CheckBox({ checked, onClick, label }: Props) {
  const id = useId();

  return (
    <div className="flex items-center gap-[8px]">
      <input
        onClick={onClick}
        id={id}
        type="checkbox"
        checked={checked}
        className={cn(CheckBoxVariants({ variant: checked ? 'active' : 'inactive' }))}
      />
      {label && (
        <label htmlFor={id} className="cursor-pointer text-label-normal font-body-2-normal">
          {label}
        </label>
      )}
    </div>
  );
}
