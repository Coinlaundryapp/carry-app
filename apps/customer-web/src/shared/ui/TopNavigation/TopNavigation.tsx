import { cn } from '@shared/lib/utils';
import { CloseIcon, ArrowLeftIcon, SearchTopIcon } from '@assets/icons';

interface TopNavigationProps {
  type: 'back' | 'close';
  title?: string;
  className?: string;
  leftClick: () => void;
  rightClick?: () => void;
}
export default function TopNavigation({
  type,
  title,
  className,
  leftClick,
  rightClick,
}: TopNavigationProps) {
  return (
    <nav
      className={cn(
        'flex h-[52px] w-full flex-shrink-0 items-center justify-between px-3',
        className,
      )}
    >
      <button
        onClick={leftClick}
        className={cn('p-1.5', {
          'p-2': type === 'close',
        })}
      >
        {type === 'close' ? <CloseIcon /> : <ArrowLeftIcon />}
      </button>

      <p className="font_headline_1 text-label-strong font-semibold">{title}</p>
      <div className="flex h-9 w-9 items-center justify-center">
        {rightClick && (
          <button onClick={rightClick} className="p-1.5">
            <SearchTopIcon />
          </button>
        )}
      </div>
    </nav>
  );
}
