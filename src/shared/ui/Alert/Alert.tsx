import { cn } from '@shared/lib/utils';
import { cva } from 'class-variance-authority';
import clsx from 'clsx';
import { CautionIcon, CircleCheckIcon } from '@assets/icons';

const alertVariants = cva('flex px-4 py-3 gap-3 items-center rounded-lg', {
  variants: {
    status: {
      success: 'bg-status-positive',
      done: 'bg-base-blue-6',
      error: 'bg-status-destructive',
    },
  },
});
interface AlertProps {
  status: 'success' | 'done' | 'error';
  label: string;
}
export default function Alert({ status, label }: AlertProps) {
  return (
    <div className={cn(alertVariants({ status }))}>
      {status === 'error' ? (
        <CautionIcon />
      ) : (
        <CircleCheckIcon
          className={clsx('h-[18px] w-[18px]', {
            'fill-status-positive': status === 'success',
            'fill-base-blue-6': status === 'done',
          })}
        />
      )}
      <p className="font-semibold text-white font-body-2-normal">{label}</p>
    </div>
  );
}
