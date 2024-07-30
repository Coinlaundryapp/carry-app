import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ArrowDownIcon, RadioOffIcon, RadioOnIcon } from '@assets/icons';

export interface DropdownProps {
  data: {
    value: string;
    label: string;
  }[];
  value: string;
  placeholder: string;
  indicator: 'check' | 'radio';
  onChange: (value: string) => void;
}

function RadioIndicator({ checked }: { checked: boolean }) {
  if (checked) {
    return <RadioOnIcon className="h-6 w-6" />;
  }
  return <RadioOffIcon className="h-6 w-6" />;
}

export default function Dropdown({
  data,
  value,
  placeholder,
  indicator = 'check',
  onChange,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'flex h-12 w-full items-center justify-between gap-3 rounded-md border border-line-normal bg-white px-4 py-3 focus:outline-none [&[data-state=open]>svg]:rotate-180',
          value === '' && 'text-label-assistive',
        )}
      >
        <p className={cn('truncate font-medium font-semibold font-label-1-normal')}>
          {value === '' ? placeholder : data.find((item) => item.value === value)?.label}
        </p>
        <ArrowDownIcon
          className={cn(
            'h-[14px] w-[14px] flex-shrink-0 fill-label-assistive transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
        />
      </button>
      {isOpen && (
        <div className="absolute top-[60px] z-50 h-48 w-full overflow-y-auto rounded-[10px] border bg-white font-semibold text-label-neutral shadow-emphasize font-body-2-reading data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2">
          {data.map((item) => (
            <button
              key={item.value}
              onClick={() => {
                onChange(item.value);
                setIsOpen(false);
              }}
              className={cn(
                'flex w-full cursor-default items-center gap-[10px] px-4 py-3 outline-none focus:bg-cyan-50 focus:text-primary-normal active:bg-cyan-50 active:text-primary-normal',
                item.value === value && 'text-primary-normal',
              )}
            >
              {indicator === 'radio' && <RadioIndicator checked={item.value === value} />}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
