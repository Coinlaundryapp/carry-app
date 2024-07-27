import { cn } from '@/lib/utils';
import Close from '../../../../public/assets/icons/close.svg';

export default function CloseIcon(props: React.ComponentProps<'svg'>) {
  return <Close className={cn('h-4 w-4 text-black', props.className)} />;
}
