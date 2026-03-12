'use client';

import * as SelectPrimitive from '@radix-ui/react-select';
import { ArrowDownIcon, RadioOffIcon, RadioOnIcon } from '@assets/icons';
import { cn } from '@shared/lib/utils';

export interface DropdownProps {
  data: {
    value: string;
    label: string;
  }[];
  value: string;
  placeholder: string;
  indicator: 'check' | 'radio';
  className?: string;
  type?: 'default' | 'time';
  disabled?: boolean;
  onChange: (value: string) => void;
}

function RadioIndicator({ checked }: Readonly<{ checked: boolean }>) {
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
  type = 'default',
  className,
  disabled = false,
  onChange,
}: Readonly<DropdownProps>) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onChange} disabled={disabled}>
      <SelectPrimitive.Trigger
        className={cn(
          'flex h-12 w-full items-center justify-between whitespace-nowrap rounded-md border border-line-normal bg-transparent px-4 py-3 focus:outline-none',
          value === '' && 'text-label-assistive',
          className,
        )}
      >
        <p
          className={cn('truncate font-medium text-label-neutral font-body-2-reading', {
            'font-label-1-normal': type === 'time',
            'text-label-assistive': value === '',
          })}
        >
          {value === '' ? placeholder : data.find((item) => item.value === value)?.label}
        </p>
        <SelectPrimitive.Icon asChild>
          <ArrowDownIcon
            className={cn(
              'h-[14px] w-[14px] flex-shrink-0 fill-label-normal transition-transform duration-200',
              value === '' && 'fill-label-assistive',
            )}
          />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className="relative z-50 max-h-64 min-w-[8rem] overflow-hidden rounded-[10px] border bg-white font-medium text-label-neutral shadow-emphasize font-body-2-reading data-[side=bottom]:translate-y-3 data-[side=left]:-translate-x-3 data-[side=right]:translate-x-3 data-[side=top]:-translate-y-3 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
          position="popper"
        >
          <SelectPrimitive.Viewport
            className={cn(
              'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]',
              type === 'time' && 'font-label-1-normal',
            )}
          >
            {data.map((item) => (
              <SelectPrimitive.Item
                key={item.value}
                value={item.value}
                className={cn(
                  'flex w-full cursor-default items-center gap-[10px] px-4 py-3 outline-none active:bg-cyan-50 active:text-primary-normal',
                  item.value === value && 'bg-cyan-50 text-primary-normal',
                )}
              >
                {indicator === 'radio' && <RadioIndicator checked={item.value === value} />}
                {item.label}
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
