import { useState } from 'react';
import Dropdown from '@/components/share/Dropdown/Dropdown';
import Separator from '@/components/share/Separator/Separator';

type DropDownOption = {
  value: string;
  label: string;
};

export default function TimeField() {
  const data: DropDownOption[] = [
    {
      value: '1',
      label: '12월31일 (일) 낮 12시 ~',
    },
    {
      value: '2',
      label: '1월1일 (월) 낮 12시 ~',
    },
    {
      value: '3',
      label: '1월2일 (화) 낮 12시 ~',
    },
    {
      value: '4',
      label: '1월2일 (화) 낮 12시 ~',
    },
  ];
  const [selected, setSelected] = useState('');
  return (
    <>
      <section className="p-5">
        <h2 className="font-semibold text-label-strong font-headline-1">
          세탁소 선택하기 <span className="text-status-destructive">*</span>
        </h2>
        <div className="mt-6">
          <p className="font-semibold text-label-strong font-body-1-normal">희망 수거 시간</p>
          <p className="mt-2 font-semibold text-label-assistive font-label-1-normal">
            신청 시각 <span className="text-primary-normal">2시간 이후</span>부터 수거를 시작합니다.
          </p>
          <Dropdown
            data={data}
            value={selected}
            onChange={(value) => setSelected(value)}
            placeholder="시간 선택"
            indicator="radio"
            type="time"
            className="mt-3"
          />
        </div>
        <div className="mt-5">
          <p className="font-semibold text-label-strong font-body-1-normal">희망 배송 완료 시간</p>
          <p className="mt-2 font-semibold text-label-assistive font-label-1-normal">
            신청 시각 <span className="text-primary-normal">6시간 이후</span>부터 받아보실 수
            있습니다.
          </p>
          <Dropdown
            data={data}
            value={selected}
            onChange={(value) => setSelected(value)}
            placeholder="시간 선택"
            indicator="radio"
            type="time"
            className="mt-3"
          />
          <div className="mt-2 font-medium text-label-assistive font-caption-1">
            <ul className="list-inside list-disc font-medium font-caption-1">
              <li>
                현재 세탁 수거 서비스는 <b className="font-semibold text-primary-normal">주말</b>만
                이용가능합니다
              </li>
              <li>
                일요일의 경우 신청 시간 마감시{' '}
                <b className="font-semibold text-primary-normal">차주 가장 빠른 주말 시간대</b>로
                안내해 드립니다
              </li>
            </ul>
          </div>
        </div>
      </section>
      <Separator variant="horizontal8" />
    </>
  );
}
