'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import Order from '@features/order/ui/Order';
import OptionSelection from '@features/order/ui/OptionSelection';
import { TopNavigation } from '@shared/ui/TopNavigation';
import { OptionsSelection } from '@features/order/ui/OptionsSelection';
import ProgressBar from '@shared/ui/ProgressBar';
import { ShoeCountSelection } from '@features/order/ui/ShoeCountSelection';
import InfoDrawer from '@features/order/ui/InfoDrawer';
import { useModalStore } from '@shared/model/modal-store';
import { DryIcon, HotWaterIcon, WaterIcon } from '@assets/icons';
import {
  AdditionalOption,
  LaundryItemType,
  LaundryOptions,
  LaundryPriceData,
  LaundryTask,
  OrderContent,
  OrderRequestType,
  OrderUnitType,
} from '@features/order/types/laundry-type';
import useOrderStore from '@features/order/model/order-store';

type OptionSteps = {
  [key in LaundryItemType]: FunnelStep[];
};
type FunnelStep =
  | 'laundryOptions'
  | 'washOptions'
  | 'dryOptions'
  | 'shoePairs'
  | 'folding'
  | 'softener'
  | 'order';

const optionSteps: OptionSteps = {
  REGULAR: ['laundryOptions', 'washOptions', 'dryOptions', 'folding', 'softener', 'order'],
  BLANKET: ['laundryOptions', 'washOptions', 'dryOptions', 'softener', 'order'],
  REGULAR_AND_BLANKET: [
    'laundryOptions',
    'washOptions',
    'dryOptions',
    'folding',
    'softener',
    'order',
  ],
  SHOES: ['shoePairs', 'laundryOptions', 'washOptions', 'dryOptions', 'order'],
};

interface LaundryFunnelProps {
  laundryItemType: LaundryItemType;
  laundryPriceData: LaundryPriceData;
  orderUnitType: OrderUnitType;
  orderRequestType: OrderRequestType;
}

export default function LaundryFunnel({
  laundryItemType,
  laundryPriceData,
  orderUnitType,
  orderRequestType,
}: Readonly<LaundryFunnelProps>) {
  const router = useRouter();
  const serviceOptions: LaundryOptions[] = [
    {
      name: '세탁 + 건조',
      icon: (
        <div className="flex gap-1">
          <WaterIcon />
          <DryIcon />
        </div>
      ),
      value: 'WASH_AND_DRY',
      selectable: true,
    },
    {
      name: '건조만',
      icon: <DryIcon />,
      value: 'DRY',
      selectable: laundryItemType !== 'SHOES',
    },
    {
      name: '세탁만',
      icon: <WaterIcon />,
      value: 'WASH',
      selectable: laundryItemType !== 'SHOES',
    },
  ];
  const washOptions: LaundryOptions[] = [
    {
      name: '표준 코스',
      description: '냉수',
      price: laundryPriceData.washOption.standard.price,
      icon: <WaterIcon />,
      value: 'STANDARD',
      selectable: laundryPriceData.washOption.standard.selectable,
    },
    {
      name: '온수 코스',
      description: '40도',
      price: laundryPriceData.washOption.hotWater.price,
      icon: <HotWaterIcon />,
      value: 'HOT_WATER',
      selectable: laundryPriceData.washOption.hotWater.selectable,
    },
  ];

  const dryOptions: LaundryOptions[] = [
    {
      name: '저온 건조',
      description: '30분',
      price: laundryPriceData.dryOption.lowHeat.price,
      icon: <DryIcon />,
      value: 'LOW_HEAT',
      selectable: laundryPriceData.dryOption.lowHeat.selectable,
    },
    {
      name: '고온 건조',
      description: '30분',
      price: laundryPriceData.dryOption.highHeat.price,
      icon: <DryIcon />,
      value: 'HIGH_HEAT',
      selectable: laundryPriceData.dryOption.highHeat.selectable,
    },
  ];
  const steps: readonly FunnelStep[] = optionSteps[laundryItemType];
  const [laundryOption, setLaundryOption] = useState<LaundryTask | null>();
  const { openModal } = useModalStore();
  const store = useOrderStore();
  const { step, orderContent, setStep, setOrderContent, addTotalAmount, reset } = store;
  const percentage = ((step + 1) / (steps.length - 1)) * 100;
  const nextStep = () => {
    let increment = 1;
    if (steps[step] === 'laundryOptions' && laundryOption === 'DRY') {
      increment = 2;
    }
    if (steps[step] === 'washOptions' && laundryOption === 'WASH') {
      increment = 2;
    }

    if (step < steps.length - 1) {
      setStep(step + increment);
    }
  };
  const prevStep = () => {
    if (step === steps.length - 1) {
      openModal({
        type: 'confirm',
        title: '앗, 주문을 취소하시겠어요?',
        description: '신청한 내용이 모두 사라집니다.\n정말 취소하고 나가시겠어요?',
        closeText: '아니요',
        confirmText: '주문 취소',
        onConfirm: () => {
          setStep(step - 1);
        },
      });
    } else if (step > 0) {
      setStep(step - 1);
    } else {
      reset(null, null, null);
      router.replace(`/`);
    }
  };
  const handleLaundryOption = (value: LaundryTask) => {
    setLaundryOption(value);
    nextStep();
  };

  const handleOptionSelect = (option: keyof OrderContent, value: LaundryOptions) => {
    setOrderContent({
      [option]: value.value,
    });
    if (value.price) {
      addTotalAmount(value.price);
    }
    nextStep();
  };

  const handleShoePairs = (value: number) => {
    const newOptions = {
      laundrySpecs: [...orderContent.laundrySpecs, { laundrySpec: 'SHOE_PAIRS', value }],
    };
    setOrderContent(newOptions);
    nextStep();
  };

  const handleAdditionalOption = (
    option: AdditionalOption,
    value: boolean,
    price: number | null,
  ) => {
    if (value) {
      if (!orderContent.additionalOptions.includes(option)) {
        setOrderContent({
          additionalOptions: [...orderContent.additionalOptions, option],
        });
        if (price) {
          addTotalAmount(price);
        }
      }
    } else {
      setOrderContent({
        additionalOptions: orderContent.additionalOptions.filter((item) => item !== option),
      });
      if (price) {
        addTotalAmount(-price);
      }
    }
    nextStep();
  };
  useEffect(() => {
    if (
      laundryItemType !== orderContent.laundryItemType ||
      orderUnitType !== orderContent.orderUnitType ||
      orderRequestType !== orderContent.orderRequestType
    ) {
      reset(orderUnitType, orderRequestType, laundryItemType);
    }
  }, [laundryItemType, orderUnitType, orderRequestType, reset, orderContent]);

  return (
    <div
      className={clsx('flex h-dvh flex-col bg-background-normal-alternative', {
        'bg-background-normal-normal': steps[step] === 'shoePairs',
      })}
    >
      {steps[step] !== 'order' && (
        <div className="mb-2.5 px-5 pt-7">
          <ProgressBar percent={percentage} />
        </div>
      )}
      <TopNavigation
        leftClick={prevStep}
        type="back"
        title={steps[step] === 'order' ? '수거 신청' : ''}
        className={clsx({
          'bg-white': steps[step] === 'order',
        })}
      />
      {steps[step] === 'shoePairs' && (
        <div className="mt-2.5 h-full px-5">
          <ShoeCountSelection onSelect={handleShoePairs} />
        </div>
      )}
      {steps[step] === 'laundryOptions' && (
        <div className="mt-2.5 h-full px-5">
          <OptionsSelection
            laundryItemType={laundryItemType}
            options={serviceOptions}
            onSelect={(value) => handleLaundryOption(value as LaundryTask)}
          />
        </div>
      )}
      {steps[step] === 'washOptions' && (
        <div className="mt-2.5 h-full px-5">
          <OptionsSelection
            laundryItemType={laundryItemType}
            options={washOptions}
            onSelect={(value) => handleOptionSelect('washOption', value as LaundryOptions)}
          />
        </div>
      )}
      {steps[step] === 'dryOptions' && (
        <div className="mt-2.5 h-full px-5">
          <OptionsSelection
            laundryItemType={laundryItemType}
            options={dryOptions}
            onSelect={(value) => handleOptionSelect('dryOption', value as LaundryOptions)}
          />
        </div>
      )}
      {steps[step] === 'folding' && (
        <div className="mt-2.5 h-full px-5">
          <OptionSelection
            type="folding"
            title="빨래를 개서 드릴까요?"
            description={
              <p className="font-medium text-label-alternative font-body-1-reading">
                <span className="font-semibold text-primary-normal font-body-1-normal">1000원</span>
                으로 귀찮음에서 해방되어 보세요!
              </p>
            }
            imageUrl="/assets/images/folding.png"
            price={laundryPriceData.additionalOption.foldLaundry.price}
            onSelect={(value, price) => handleAdditionalOption('FOLD_LAUNDRY', value, price)}
          />
        </div>
      )}
      {steps[step] === 'softener' && (
        <div className="mt-2.5 h-full px-5">
          <OptionSelection
            type="softener"
            title="섬유유연제를 무료로 추가할 수 있어요"
            description={
              <p className="font-medium text-label-alternative font-body-1-reading">
                깨끗한 세탁물에 기분 좋은 향까지 받아 보세요
              </p>
            }
            imageUrl="/assets/images/softener.png"
            price={laundryPriceData.additionalOption.addSoftener.price}
            onSelect={(value, price) => handleAdditionalOption('ADD_SOFTENER', value, price)}
          />
        </div>
      )}
      {steps[step] === 'order' && (
        <Order currentUrl={`order/${orderUnitType}/${orderRequestType}/${laundryItemType}`} />
      )}
      <InfoDrawer defaultOpen={steps[step] !== 'shoePairs' && step === 0} />
    </div>
  );
}
