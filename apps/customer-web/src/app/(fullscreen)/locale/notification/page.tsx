'use client';

import Button from '@shared/ui/Button/Button';
import { Input } from '@shared/ui/Input';
import { useRouter, useSearchParams } from 'next/navigation';
import LocaleImg from '@assets/images/locale-image.png';
import Image from 'next/image';
import { useModalStore } from '@shared/model/modal-store';
import { useSession } from 'next-auth/react';
import { fetchExtended } from '@shared/api/api-client';
import { NotificationBody } from '@shared/types/api-types';
import { useState } from 'react';

const OpenNotificationPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const city = searchParams.get('city');
  const district = searchParams.get('district');
  const session = useSession();
  const accessToken = session?.data?.user?.accessToken;

  const openModal = useModalStore((state) => state.openModal);

  const [body, setBody] = useState<NotificationBody>({
    region: {
      city: city || '',
      district: district || '',
    },
    notificationType: 'SMS',
    contact: '',
  });

  const inputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBody((prev) => ({
      ...prev,
      contact: e.target.value,
    }));
  };

  const doneHandler = async () => {
    const req = await fetchExtended('/api/v1/service-availability/notifications', {
      method: 'post',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body,
    });
    if (req) {
      openModal({
        type: 'basic',
        image: 'check',
        title: '오픈 신청이 완료되었어요!',
        closeText: '확인',
        onClose: () => router.push('/'),
      });
    }
  };

  return (
    <div className="flex h-full flex-1 flex-col items-center justify-between pb-[30px] pt-[73px]">
      <div className="flex flex-col items-center gap-3">
        <p className="font-title-1 whitespace-pre text-center font-bold">
          {district}가 오픈되면 알려드릴게요
        </p>
        <p className="text-label-neutral font-body-2-normal text-center">
          전화번호를 알려주시면 문자로 알려드립니다 <br />
          최대한 빨리 찾아뵐게요:)
        </p>
      </div>
      <div className="flex h-[180px] w-[350px] items-center justify-center">
        <Image src={LocaleImg} alt="..." width={224} height={180} />
      </div>
      <div className="flex w-full flex-col gap-[24px] px-[24px]">
        <Input
          type="number"
          status="default"
          title="전화번호"
          value={body.contact}
          onChange={inputHandler}
          maxLength={13}
        />
        <div className="flex items-center gap-[20px]">
          <Button
            state="primary"
            size="full"
            onClick={() => {
              router.push('/');
            }}
          >
            나가기
          </Button>
          <Button
            state={body.contact.length < 11 ? 'disabled' : 'fillPrimary'}
            size="full"
            onClick={doneHandler}
            disabled={body.contact.length < 11}
          >
            전화번호 알려주기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OpenNotificationPage;
