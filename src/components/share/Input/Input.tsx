import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { InputDeleteIcon } from '@assets/icons';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  type: 'text' | 'number';
  status: 'default' | 'error' | 'success' | 'done' | 'primary';
  statusMessage?: string;
  title?: string;
  titleColor?: 'strong' | 'normal';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  errorIcon?: React.ReactNode;
  successIcon?: React.ReactNode;
  className?: string;
  fontStyle?: string;
  iconstate?: string;
  onClear?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const inputTitleVariants = cva('font-label-1-normal text-label-strong', {
  variants: {
    titleColor: {
      strong: 'text-label-strong ',
      normal: 'text-label-normal',
    },
    fontStyle: {
      strong: 'font-bold ',
    },
  },
});

const inputBoxVariants = cva(
  'flex w-full px-4 py-2 gap-3 rounded-md items-center text-label-alternative h-[46px]',
  {
    variants: {
      status: {
        primary: 'border border-line-normal has-[:focus]:border-primary-normal',
        default: 'border border-line-normal has-[:focus]:border-cool-neutral-22',
        error: 'border border-status-destructive bg-background-normal-alternative',
        success: 'border border-status-positive bg-background-normal-alternative',
        done: 'bg-background-normal-alternative',
      },
    },
  },
);

const statusMessageVariants = cva('px-2 font-caption-1', {
  variants: {
    status: {
      default: '',
      error: 'text-status-destructive',
      success: 'text-status-positive',
      done: '',
      primary: '',
    },
  },
});

export function Input({
  type,
  status = 'default',
  title,
  statusMessage,
  leftIcon,
  successIcon,
  errorIcon,
  titleColor = 'normal',
  className,
  fontStyle,
  onClear,
  iconstate,
  ...props
}: InputProps) {
  const canValueClear = props.value && status === 'default' && onClear;
  console.log("ccc",canValueClear)
  return (
    <div className={cn('group w-full space-y-3', className)}>
      {title && (
        <label
          className={cn(
            inputTitleVariants({
              titleColor,
            }),
            fontStyle && fontStyle,
          )}
        >
          {title}
        </label>
      )}
      <div
        className={inputBoxVariants({
          status,
        })}
      >
        {leftIcon && <div>{leftIcon}</div>}
        <input
          type="text"
          inputMode={type === 'number' ? 'numeric' : 'text'}
          readOnly={status === 'done'}
          className={`peer w-full bg-transparent text-label-normal caret-primary-normal font-body-2-normal placeholder:text-label-assistive focus:outline-none ${iconstate ? iconstate : ''}`}
          {...props}
          {...props}
        />
        {status === 'success' && successIcon && <div>{successIcon}</div>}
        {status === 'error' && errorIcon && <div>{errorIcon}</div>}
        {canValueClear && (
          <button type="button" onClick={onClear}>
            <InputDeleteIcon />
          </button>
        )}
      </div>
      {statusMessage && (
        <p
          className={statusMessageVariants({
            status,
          })}
        >
          {statusMessage}
        </p>
      )}
    </div>
  );
}
