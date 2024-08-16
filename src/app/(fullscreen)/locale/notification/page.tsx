'use client';

import Button from '@/components/share/Button/Button';
import { Input } from '@/components/share/Input';
import { useRouter } from 'next/navigation';
import LocaleImg from '@assets/images/locale-image.png';
import Image from 'next/image';

const OpenNotificationPage = () => {
  const router = useRouter();

  return (
    <div className="flex flex-1 flex-col items-center justify-between pb-[30px] pt-[73px]">
      <div className="flex flex-col items-center gap-3">
        <p className="whitespace-pre text-center font-bold font-title-1">
          해당 지역이 오픈되면 알려드릴게요
        </p>
        <p className="text-center text-label-neutral font-body-2-normal">
          전화번호를 알려주시면 문자로 알려드립니다 <br />
          최대한 빨리 찾아뵐게요:)
        </p>
      </div>
      <div className="flex h-[180px] w-[350px] items-center justify-center">
        <Image src={LocaleImg} alt="..." width={224} height={180} />
      </div>
      <div className="flex flex-col gap-[24px]">
        <Input type="number" status="default" title="전화번호" />
        <div className="flex items-center gap-[20px]">
          <Button
            state="primary"
            size="small"
            onClick={() => {
              router.push('/');
            }}
          >
            나가기
          </Button>
          <Button state="fillPrimary" size="small" onClick={() => {}}>
            전화번호 알려주기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OpenNotificationPage;
