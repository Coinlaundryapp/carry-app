import { cn } from '@/lib/utils';
import RadioOn from '../../../../public/assets/icons/radio-on.svg';

export default function RadioOnIcon(props: React.ComponentProps<'svg'>) {
  return <RadioOn className={cn('h-6 w-6', props.className)} />;
}
