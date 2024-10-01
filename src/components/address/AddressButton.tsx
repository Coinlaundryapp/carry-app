import { cn } from '@/lib/utils';
import React from 'react';

type TProps = {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
};
function AddressButton({ onClick, children, disabled, className, ...rest }: TProps) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={cn(className, 'h-[52px] font-semibold w-full rounded-md text-white')}
      {...rest}
    >
      {children}
    </button>
  );
}

export default AddressButton;
