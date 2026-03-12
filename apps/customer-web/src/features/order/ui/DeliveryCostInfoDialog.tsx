import Separator from '@shared/ui/Separator/Separator';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@shared/ui/primitives/dialog';
import { ExitIcon, QuestionMarkIcon, SelectIcon } from '@assets/icons';
import { cn } from '@shared/lib/utils';
import {
  BASE_COST,
  BASE_DISTANCE,
  COST_INCREMENT,
  DISTANCE_INCREMENT,
} from '@features/order/lib/policy';

interface CostItem {
  label: string;
  cost: string;
  maxDistance: number;
}

const generateCostItem = (index: number): CostItem => {
  if (index === 0) {
    return {
      label: `${BASE_DISTANCE}m 이내`,
      cost: `${BASE_COST}원`,
      maxDistance: BASE_DISTANCE,
    };
  }

  const maxDistance = BASE_DISTANCE + index * DISTANCE_INCREMENT;
  return {
    label: `${maxDistance}m 이내`,
    cost: `${BASE_COST + index * COST_INCREMENT}원`,
    maxDistance,
  };
};

const findRelevantRanges = (distance: number): CostItem[] => {
  if (distance <= BASE_DISTANCE) {
    return [generateCostItem(0), generateCostItem(1), generateCostItem(2)];
  }

  const currentIndex = Math.floor((distance - BASE_DISTANCE) / DISTANCE_INCREMENT) + 1;
  const ranges: CostItem[] = [];

  if (currentIndex > 1) {
    ranges.push(generateCostItem(currentIndex - 1));
  }
  ranges.push(generateCostItem(currentIndex));
  ranges.push(generateCostItem(currentIndex + 1));

  return ranges;
};
export default function DeliveryCostInfoDialog({ distance }: Readonly<{ distance: number }>) {
  const relevantRanges = findRelevantRanges(distance);
  const currentCost = relevantRanges.find((item) => distance <= item.maxDistance)?.cost;
  return (
    <Dialog>
      <DialogTrigger>
        <QuestionMarkIcon />
      </DialogTrigger>
      <DialogContent>
        <div className="px-6 py-5">
          <div className="flex items-center justify-between">
            <DialogTitle asChild>
              <p className="text-label-normal font-headline-1 font-semibold">배송비 안내</p>
            </DialogTitle>
            <DialogClose>
              <ExitIcon />
            </DialogClose>
          </div>
          <div className="mt-3 flex flex-col gap-2.5">
            <Separator variant="horizontal" />
            <div className="text-label-neutral font-caption-1 flex justify-between font-semibold">
              <p>거리별</p>
              <p>배송비</p>
            </div>
            {relevantRanges.map((item) => (
              <div
                key={item.label}
                className={cn(
                  'text-label-normal font-label-1-reading flex justify-between font-semibold',
                  {
                    'text-primary-normal': currentCost === item.cost,
                  },
                )}
              >
                <div className="flex items-center gap-1">
                  <p>{item.label}</p>
                  {currentCost === item.cost && <SelectIcon />}
                </div>
                <p>{item.cost}</p>
              </div>
            ))}

            <ul className="text-label-alternative font-caption-1 space-y-0 font-medium [&>li]:relative [&>li]:pl-[8px] [&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:content-['•']">
              <li>1Km 초과할 경우 100m당 300원씩 추가 부가됩니다.</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
