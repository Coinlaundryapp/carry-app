import { Progress } from '@/components/share/ui/progress';
import { cva } from 'class-variance-authority';

const colorVariants = cva('h-full w-full flex-1 transition-all', {
  variants: {
    color: {
      default: 'bg-primary-normal',
      blue: 'bg-base-blue-6',
    },
  },
});
export default function ProgressBar({
  percent,
  color = 'default',
}: {
  percent: number;
  color?: 'default' | 'blue';
}) {
  return <Progress value={percent} color={colorVariants({ color })} />;
}
