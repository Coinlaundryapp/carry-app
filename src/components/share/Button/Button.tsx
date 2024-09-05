import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';
import React from 'react';

type TProps = {
  children?: React.ReactNode;
  borderStyle?: string;
  backgroundColor?: string;
  className?: string;
  color?: string;
  borderColor?: string;
  size?: 'small' | 'medium' | 'large' | 'full' | 'hug';
  state: 'primary' | 'secondary' | 'fillPrimary' | 'fillSecondary' | 'default' | 'disabled';
  onClick?: () => void;
  disabled?: boolean;
};

const buttonVariants = cva('rounded-md border font-semibold', {
  variants: {
    size: {
      small: 'w-[140px] py-1 px-2 h-[52px] font_body_1_normal ',
      medium: 'w-[310px] py-2 px-4 h-[52px] font_body_1_normal ',
      large: 'w-[342px] py-3 px-6 h-[52px] font_body_1_normal ',
      hug: 'py-1 px-2 font-label-1-normal',
      full: 'flex w-full items-center justify-center h-[52px] font_body_1_normal ',
    },
    state: {
      primary: 'border-primary-normal text-primary-normal',
      secondary: 'border-neutral-80 text-neutral-80',
      fillPrimary: 'border-0 bg-primary-normal text-white',
      fillSecondary: 'bg-neutral-80 text-white',
      default: 'border-black',
      disabled: 'border-0 bg-label-assistive text-white',
    },
  },
  defaultVariants: {
    size: 'medium',
    state: 'default',
  },
});
function Button({ children, disabled, className, onClick, state, size, ...rest }: TProps) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={cn(buttonVariants({ size, state }), className)}
      {...rest}
    >
      {children}
    </button>
  );
}

export default Button;
