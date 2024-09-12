import { Drawer, DrawerClose, DrawerContent, DrawerTrigger } from '@/components/share/ui/drawer';
import Separator from '@/components/share/Separator/Separator';
import { ExitIcon, QuestionMarkIcon, SelectIcon } from '@assets/icons';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTrigger } from '@/components/share/ui/dialog';

const DISTANCE_COST_MAP = [
  { label: '100m 이내', cost: '4,000원', maxDistance: 1000 },
  { label: '200m 이내', cost: '4,300원', maxDistance: 1200 },
  { label: '300m 이내', cost: '4,600원', maxDistance: 1300 },
];

export default function DeliveryCostInfoDrawer({ distance }: Readonly<{ distance: number }>) {
  const cost = DISTANCE_COST_MAP.find((item) => distance <= item.maxDistance)?.cost;
  return (
    <Dialog>
      <DialogTrigger>
        <QuestionMarkIcon />
      </DialogTrigger>
      <DialogContent>
        <div className="px-6 py-5">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-label-normal font-headline-1">배송비 안내</p>
            <DrawerClose>
              <ExitIcon />
            </DrawerClose>
          </div>
          <div className="mt-3 flex flex-col gap-2.5">
            <Separator variant="horizontal" />
            <div className="flex justify-between font-semibold text-label-neutral font-caption-1">
              <p>거리별</p>
              <p>배송비</p>
            </div>
            {DISTANCE_COST_MAP.map((item, index) => (
              <div
                key={item.label}
                className={cn(
                  'flex justify-between font-semibold text-label-normal font-label-1-reading',
                  {
                    'text-primary-normal': cost === item.cost,
                  },
                )}
              >
                <div className="flex items-center gap-1">
                  <p>{item.label}</p>
                  {cost === item.cost && <SelectIcon />}
                </div>
                <p>{item.cost}</p>
              </div>
            ))}

            <ul className="space-y-0 font-medium text-label-alternative font-caption-1 [&>li]:relative [&>li]:pl-[8px] [&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:content-['•']">
              <li>1Km 초과할 경우 100m당 200원씩 추가 부가됩니다.</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
