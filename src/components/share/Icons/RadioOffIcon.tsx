import { cn } from '@/lib/utils';
import RadioOff from '../../../../public/assets/icons/radio-off.svg';

export default function RadioOffIcon(props: React.ComponentProps<'svg'>) {
  return <RadioOff className={cn('h-6 w-6', props.className)} />;
}
