import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';
import React, { createContext, PropsWithChildren, useContext } from 'react';

type Props = {
  value: string;
  onChange: (value: string) => void;
  size?: 'small' | 'big';
};

const RadioContext = createContext<Props | null>(null);

function Group({ children, onChange, value, size = 'small' }: PropsWithChildren<Props>) {
  return (
    <RadioContext.Provider value={{ value, onChange, size }}>{children}</RadioContext.Provider>
  );
}

const RadioButtonVariants = cva(
  `rounded-full appearance-none border-[1.5px] cursor-pointer flex-shrink-0 p-0.5`,
  {
    variants: {
      variant: {
        active: 'bg-cyan-50 border-primary-normal',
        inactive: 'bg-static-white border-label-assistive',
      },
      size: {
        small: 'w-[16px] h-[16px] checked:border-[4.5px]',
        big: 'w-[20px] h-[20px] checked:border-[6px]',
      },
    },
    defaultVariants: {
      variant: 'inactive',
    },
  },
);

function Button({ value }: Pick<Props, 'value'>) {
  const context = useContext(RadioContext);
  const checked = context?.value === value;

  return (
    <input
      type="radio"
      checked={checked}
      onChange={() => context?.onChange(value)}
      className={cn(
        RadioButtonVariants({
          variant: checked ? 'active' : 'inactive',
          size: context?.size,
        }),
      )}
    />
  );
}

export const Radio = {
  Button,
  Group,
};
