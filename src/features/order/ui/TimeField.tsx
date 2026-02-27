import { ko } from 'date-fns/locale';
import {
  format,
  addDays,
  setHours,
  setMinutes,
  isSaturday,
  isSunday,
  isAfter,
  addHours,
  setSeconds,
  setMilliseconds,
  parseISO,
  isEqual,
} from 'date-fns';
import Dropdown from '@shared/ui/Dropdown/Dropdown';
import Separator from '@shared/ui/Separator/Separator';
import { OrderSchedule } from '@features/order/types/laundry-type';
import { useEffect, useMemo } from 'react';

interface TimeRange {
  start: number;
  end: number;
}

interface DateTimeOption {
  value: string;
  label: string;
}

const generateDateTimeOptions = (
  startDate: Date = new Date(),
  daysAhead: number = 7,
  operatingHours: TimeRange = { start: 10, end: 22 },
  isDelivery: boolean = false,
  pickupDateTime?: string,
): DateTimeOption[] => {
  const options: DateTimeOption[] = [];
  const endDate = addDays(startDate, daysAhead);
  const now = new Date();
  const twoHoursLater = addHours(now, 2);
  const roundedTwoHoursLater = setMinutes(setHours(twoHoursLater, twoHoursLater.getHours()), 30);

  const pickupDate = pickupDateTime ? parseISO(pickupDateTime) : null;
  const deliveryStartTime = pickupDate ? addHours(pickupDate, 2) : null;

  for (let currentDate = startDate; currentDate < endDate; currentDate = addDays(currentDate, 1)) {
    if (isSaturday(currentDate) || isSunday(currentDate)) {
      for (let hour = operatingHours.start; hour <= operatingHours.end; hour++) {
        for (let minute of [0, 30]) {
          if (minute === 30 && hour === operatingHours.end) {
            continue;
          }
          const dateTime = setMilliseconds(
            setSeconds(setMinutes(setHours(currentDate, hour), minute), 0),
            0,
          );

          const isValidTime = isDelivery
            ? deliveryStartTime &&
              (isAfter(dateTime, deliveryStartTime) || isEqual(dateTime, deliveryStartTime))
            : isAfter(dateTime, roundedTwoHoursLater);

          if (isValidTime) {
            const value = dateTime.toISOString();
            const label = `${format(dateTime, 'MM/dd EEE', { locale: ko })} ${getTimePeriod(hour, minute)}`;

            options.push({ value, label });
          }
        }
      }
    }
  }

  return options;
};

const getTimePeriod = (hour: number, minute: number): string => {
  const period = hour < 12 ? '오전' : '오후';
  const adjustedHour = hour % 12 || 12;
  const minuteString = minute === 0 ? '' : '30분';

  return `${period} ${adjustedHour}시 ${minuteString}`.trim();
};
export default function TimeField({
  orderSchedule,
  setOrderSchedule,
}: Readonly<{
  orderSchedule: OrderSchedule;
  setOrderSchedule: (schedule: OrderSchedule) => void;
}>) {
  // date는 컴포넌트 마운트 시점 기준으로 고정 — deps에 넣으면 매 렌더마다 재생성되어 무한 루프
  const date = new Date();
  const desiredPickupDateTimeOptions = useMemo(
    () => generateDateTimeOptions(date, 7, { start: 10, end: 20 }, false),
    [], // eslint-disable-line react-hooks/exhaustive-deps -- date는 마운트 시점 고정
  );
  const desiredDeliveryDateTimeOptions = useMemo(() => {
    return generateDateTimeOptions(
      date,
      7,
      { start: 10, end: 22 },
      true,
      orderSchedule.desiredPickupDateTime,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderSchedule.desiredPickupDateTime]);
  const handlePickupDateTimeChange = (value: string) => {
    setOrderSchedule({
      desiredPickupDateTime: value,
      desiredDeliveryDateTime: '',
    });
  };
  const handleDeliveryDateTimeChange = (value: string) => {
    setOrderSchedule({
      ...orderSchedule,
      desiredDeliveryDateTime: value,
    });
  };
  useEffect(() => {
    if (
      orderSchedule.desiredPickupDateTime !== '' &&
      orderSchedule.desiredDeliveryDateTime !== ''
    ) {
      return;
    }

    setOrderSchedule({
      desiredPickupDateTime: desiredPickupDateTimeOptions[0]?.value ?? '',
      desiredDeliveryDateTime: desiredDeliveryDateTimeOptions[0]?.value ?? '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 초기 마운트 시 + 옵션 변경 시에만 실행
  }, [desiredPickupDateTimeOptions, desiredDeliveryDateTimeOptions]);

  return (
    <>
      <section className="p-5">
        <h2 className="font-semibold text-label-strong font-headline-1">수거/배달 일정</h2>
        <div className="mt-6">
          <p className="font-semibold text-label-strong font-body-1-normal">희망 수거 시간</p>
          <p className="mt-2 font-semibold text-label-assistive font-label-1-normal">
            신청 시각 <span className="text-primary-normal">2시간 이후</span>부터 수거를 시작합니다.
          </p>
          <Dropdown
            data={desiredPickupDateTimeOptions}
            value={orderSchedule.desiredPickupDateTime}
            onChange={handlePickupDateTimeChange}
            placeholder="시간 선택"
            indicator="radio"
            type="time"
            className="mt-3"
          />
        </div>
        <div className="mt-5">
          <p className="font-semibold text-label-strong font-body-1-normal">희망 배송 완료 시간</p>
          <p className="mt-2 font-semibold text-label-assistive font-label-1-normal">
            수거 시각 <span className="text-primary-normal">2시간 이후</span>부터 배송이 시작됩니다.
          </p>
          <Dropdown
            data={desiredDeliveryDateTimeOptions}
            value={orderSchedule.desiredDeliveryDateTime}
            onChange={handleDeliveryDateTimeChange}
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
