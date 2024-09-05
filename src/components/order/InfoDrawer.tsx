import { useState } from 'react';
import Image from 'next/image';
import Button from '@/components/share/Button';
import { Drawer, DrawerClose, DrawerContent } from '@/components/share/ui/drawer';

export default function InfoDrawer() {
  const [open, setOpen] = useState(true);
  return (
    <Drawer open={open} onOpenChange={setOpen} scrollLockTimeout={3000}>
      <DrawerContent showIndicator={false}>
        <div className="flex w-full flex-col items-center px-6 pb-5 pt-[30px] font-semibold text-label-strong font-heading-2">
          <p>
            <span className="text-primary-normal">검흰빨래</span> 걱정이신가요?
          </p>
          <p>이염 방지 시트 사용하니 걱정마세요!</p>
          <Image
            src="/assets/images/basket.png"
            alt="Laundry info"
            width={120}
            height={120}
            className="mb-8 mt-6"
          />
          <DrawerClose asChild>
            <Button state="fillPrimary" size="full">
              확인
            </Button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
