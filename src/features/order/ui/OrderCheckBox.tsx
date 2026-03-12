import { cn } from '@shared/lib/utils';
import { CheckIcon } from '@assets/icons';

export default function OrderCheckBox({
  type,
  checked,
  onChange,
  children,
  className,
}: Readonly<{
  id: string;
  type: 'circle' | 'check';
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  children: React.ReactNode;
}>) {
  return (
    <div
      className={cn('flex space-x-3 px-4', className, {
        'py-2': type === 'circle',
        'py-1': type === 'check',
      })}
    >
      <button
        className={cn(
          'flex h-[18px] w-[18px] flex-shrink-0 cursor-pointer items-center justify-center',
          {
            'mt-[2px] rounded-full bg-label-assistive': type === 'circle',
            'bg-primary-normal': type === 'circle' && checked,
            'bg-transparent': type === 'check',
          },
        )}
        onClick={() => onChange(!checked)}
      >
        <CheckIcon
          className={cn('fill-static-white', {
            'fill-label-assistive': type === 'check' && !checked,
            'fill-primary-normal': type === 'check' && checked,
          })}
        />
      </button>
      {children}
    </div>
  );
}
