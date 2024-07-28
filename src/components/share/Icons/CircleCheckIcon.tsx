import { cn } from '@/lib/utils';
import CircleCheck from '../../../../public/assets/icons/circle-check.svg';

export default function CircleCheckIcon(props: React.ComponentProps<'svg'>) {
  return <CircleCheck className={cn('h-4 w-4', props.className)} />;
}
