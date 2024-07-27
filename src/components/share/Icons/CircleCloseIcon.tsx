import { cn } from '@/lib/utils';
import CircleClose from '../../../../public/assets/icons/circle-close.svg';

export default function CircleCloseIcon(props: React.ComponentProps<'svg'>) {
  return <CircleClose className={cn('h-4 w-4 text-status-positive', props.className)} />;
}
