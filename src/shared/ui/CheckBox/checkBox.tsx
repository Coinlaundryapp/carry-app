import React, { useId } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@shared/lib/utils';
import CheckIcon from '@/../public/assets/icons/check.svg';
import { twMerge } from 'tailwind-merge';

type CheckBoxType = 'circle' | 'square' | 'icon';

type Props = {
  checked: boolean;
  onClick: VoidFunction;
  label?: string;
  type?: CheckBoxType;
  textClassName?: string;
};

const CheckBoxVariants = cva(`appearance-none w-[18px] h-[18px] border-[1.5px] cursor-pointer`, {
  variants: {
    type: {
      square:
        'rounded-[3px] border-label-assistive bg-static-white checked:border-primary-normal checked:bg-primary-normal',
      circle:
        'rounded-full bg-cool-neutral-90 border-cool-neutral-90 checked:border-primary-normal checked:bg-primary-normal',
      icon: 'border-none',
    },
  },
  defaultVariants: {
    type: 'square',
  },
});

type ColorSet = `${CheckBoxType}_${'checked' | 'unchecked'}`;

const CheckIconVariants = cva<{ type: Record<ColorSet, string> }>('fill-static-white', {
  variants: {
    type: {
      icon_checked: 'fill-primary-normal',
      icon_unchecked: 'fill-cool-neutral-90',
      // 요 아래는 무조건 white
      square_checked: '',
      square_unchecked: 'fill-none',
      circle_checked: '',
      circle_unchecked: '',
    },
  },
});

export function CheckBox({ checked, onClick, label, textClassName, type = 'square' }: Props) {
  const id = useId();

  return (
    <div className="flex items-center gap-[8px] whitespace-nowrap">
      <div className="relative flex items-center">
        <input
          onClick={onClick}
          id={id}
          type="checkbox"
          checked={checked}
          className={cn(CheckBoxVariants({ type }))}
        />
        <div className="margin-auto absolute inset-0 flex h-full w-full items-center justify-center">
          <CheckIcon
            className={cn(
              CheckIconVariants({ type: `${type}_${checked ? 'checked' : 'unchecked'}` }),
            )}
          />
        </div>
      </div>
      {label && (
        <label
          htmlFor={id}
          className={twMerge('cursor-pointer text-label-normal font-body-2-normal', textClassName)}
        >
          {label}
        </label>
      )}
    </div>
  );
}
