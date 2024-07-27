import { cn } from '@/lib/utils';
import SearchTop from '../../../../public/assets/icons/search-top.svg';

export default function SearchTopIcon(props: React.ComponentProps<'svg'>) {
  return <SearchTop className={cn('h-6 w-6 text-[#292929]', props.className)} />;
}
