import { cn } from '@/lib/utils';
import ArrowDown from '../../../../public/assets/icons/arrow-down.svg';

export default function ArrowDownIcon(props: React.ComponentProps<'svg'>) {
  return <ArrowDown className={cn('h-[14px] w-[14px] fill-label-assistive', props.className)} />;
}
