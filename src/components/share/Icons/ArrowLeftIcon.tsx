import { cn } from '@/lib/utils';
import ArrowLeft from '../../../../public/assets/icons/arrow-left.svg';

export default function ArrowLeftIcon(props: React.ComponentProps<'svg'>) {
  return <ArrowLeft className={cn('h-6 w-6 text-[#292929]', props.className)} />;
}
