import { cn } from '@/lib/utils';
import Search from '../../../../public/assets/icons/search.svg';

export default function SearchIcon(props: React.ComponentProps<'svg'>) {
  return <Search className={cn('h-6 w-6', props.className)} />;
}
