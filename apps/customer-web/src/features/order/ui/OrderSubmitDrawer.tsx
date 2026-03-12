'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { postOrder } from '@features/order/api/order';
import useOrderStore from '@features/order/model/order-store';
import { useToastStore } from '@shared/model/toast-store';
import Button from '@shared/ui/Button';
import { Drawer, DrawerClose, DrawerContent, DrawerTrigger } from '@shared/ui/primitives/drawer';
import { LaundryBasketIcon, LaundryIcon } from '@assets/icons';

export default function OrderSubmitDrawer({ canSubmit }: Readonly<{ canSubmit: boolean }>) {
  const session = useSession();
  const accessToken = session.data?.user.accessToken as string;
  const router = useRouter();
  const addToast = useToastStore((state) => state.addToast);
  const { orderContent, addressId, laundromat, orderSchedule, reset } = useOrderStore();
  const laundromatId = laundromat?.id as number;
  const mutation = useMutation({
    mutationFn: () =>
      postOrder({
        accessToken,
        orderContent,
        laundromatId,
        addressId: addressId as number,
        orderSchedule,
      }),
    onSuccess: (data) => {
      reset();
      router.replace(`/status/${data.id}`);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : '주문 처리 중 오류가 발생했습니다.';
      addToast({ message, type: 'error' });
    },
  });
  return (
    <Drawer>
      <div className="shadow-emphasize w-full bg-white p-6">
        <DrawerTrigger asChild disabled={!canSubmit}>
          <Button state={canSubmit ? 'disabled' : 'fillPrimary'} size="full" disabled={canSubmit}>
            수거 신청하기
          </Button>
        </DrawerTrigger>
      </div>
      <DrawerContent showIndicator={false} className="flex flex-col px-6 pb-[20px] pt-[30px]">
        <p className="text-label-strong font-heading-2 mb-6 text-center font-semibold">
          꼭 읽어주세요!
        </p>
        <div className="text-label-neutral font-headline-1 mb-6 font-semibold">
          <div className="mb-6 flex gap-4">
            <LaundryBasketIcon />
            <p>
              <b className="text-primary-normal font-semibold">수거 완료 후</b> 무게를 책정하여
              <br />
              정확한 금액을 보내드립니다.
            </p>
          </div>
          <div className="flex gap-4">
            <LaundryIcon />
            <p>
              세탁물이 <b className="text-primary-normal font-semibold">18kg 초과</b> 시
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
