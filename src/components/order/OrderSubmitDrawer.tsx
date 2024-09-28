'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { postOrder } from '@/api/order';
import useOrderStore from '@/store/order-store';
import Button from '@/components/share/Button';
import { Drawer, DrawerClose, DrawerContent, DrawerTrigger } from '@/components/share/ui/drawer';
import { LaundryBasketIcon, LaundryIcon } from '@assets/icons';

export default function OrderSubmitDrawer({ canSubmit }: Readonly<{ canSubmit: boolean }>) {
  const session = useSession();
  const accessToken = session.data?.user.accessToken as string;
  const router = useRouter();
  const { orderContent, address, laundryromat, orderSchedule, reset } = useOrderStore();
  const addressId = address?.id as number;
  const laundryromatId = laundryromat?.id as number;
  const mutation = useMutation({
    mutationFn: () =>
      postOrder({
        accessToken,
        orderContent,
        laundryromatId,
        addressId,
        orderSchedule,
      }),
    onSuccess: (data) => {
      reset();
      router.replace(`/status/${data.id}`);
    },
    onError: (error) => {
      alert(error);
    },
  });
  return (
    <Drawer>
      <div className="sticky bottom-0 w-full bg-white p-6 shadow-emphasize">
        <DrawerTrigger asChild disabled={!canSubmit}>
          <Button state={canSubmit ? 'disabled' : 'fillPrimary'} size="full" disabled={canSubmit}>
            수거 신청하기
          </Button>
        </DrawerTrigger>
      </div>
      <DrawerContent showIndicator={false} className="flex flex-col px-6 pb-[20px] pt-[30px]">
        <p className="mb-6 text-center font-semibold text-label-strong font-heading-2">
          꼭 읽어주세요!
        </p>
        <div className="mb-6 font-semibold text-label-neutral font-headline-1">
          <div className="mb-6 flex gap-4">
            <LaundryBasketIcon />
            <p>
              <b className="font-semibold text-primary-normal">수거 완료 후</b> 무게를 책정하여
              <br />
              정확한 금액을 보내드립니다.
            </p>
          </div>
          <div className="flex gap-4">
            <LaundryIcon />
            <p>
              세탁물이 <b className="font-semibold text-primary-normal">18kg 초과</b> 시
              <br />
              요금이 추가될 수 있습니다.
            </p>
          </div>
        </div>
        <DrawerClose asChild>
          <Button
            state={mutation.isPending ? 'disabled' : 'fillPrimary'}
            size="full"
            disabled={mutation.isPending}
            onClick={() => {
              mutation.mutate();
            }}
          >
            확인
          </Button>
        </DrawerClose>
      </DrawerContent>
    </Drawer>
  );
}
