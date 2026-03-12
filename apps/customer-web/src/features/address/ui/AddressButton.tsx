import { cn } from '@shared/lib/utils';
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
      className={cn(className, 'h-[52px] w-full rounded-md font-semibold text-white')}
      {...rest}
    >
      {children}
    </button>
  );
}

export default AddressButton;
