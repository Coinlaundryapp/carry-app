import { Progress } from '@/components/ui/progress';

export default function ProgressBar({ percent }: { percent: number }) {
  return <Progress value={percent} />;
}
