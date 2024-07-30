import { Progress } from '@/components/share/ui/progress';

export default function ProgressBar({ percent }: { percent: number }) {
  return <Progress value={percent} />;
}
