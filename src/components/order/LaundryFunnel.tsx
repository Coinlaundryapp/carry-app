'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import clsx from 'clsx';
import useSelectedOptionsStore from '@/store/order-store';
import OptionSelection from '@/components/order/OptionSelection';
import { TopNavigation } from '@/components/share/TopNavigation';
import { OptionsSelection } from '@/components/order/OptionsSelection';
import ProgressBar from '@/components/share/ProgressBar';
import { ShoeCountSelection } from '@/components/order/ShoeCountSelection';
import InfoDrawer from '@/components/order/InfoDrawer';
import { LaundryType, SelectedOptions } from '@/types/laundry-type';

type FunnelStep =
  | 'laundryOptions'
  | 'washOptions'
  | 'dryOptions'
  | 'shoePairs'
  | 'folding'
  | 'softener'
  | 'confirm';

type OptionSteps = {
  [key in LaundryType]: FunnelStep[];
};

const optionSteps: OptionSteps = {
  general: ['laundryOptions', 'washOptions', 'dryOptions', 'folding', 'softener'],
  bedding: ['laundryOptions', 'washOptions', 'dryOptions', 'softener'],
  mixed: ['laundryOptions', 'washOptions', 'dryOptions', 'folding', 'softener'],
  shoes: ['shoePairs', 'laundryOptions', 'washOptions', 'dryOptions'],
};

interface LaundryFunnelProps {
  laundryType: LaundryType;
}

export default function LaundryFunnel({ laundryType }: Readonly<LaundryFunnelProps>) {
  const session = useSession();
  const router = useRouter();
  const steps: readonly FunnelStep[] = optionSteps[laundryType];
  const { washOptions, setWashOptions, resetOptions } = useSelectedOptionsStore();
  const [currentStep, setCurrentStep] = useState<FunnelStep>(
    washOptions.service ? steps[steps.length - 1] : steps[0],
  );
  const [showDrawer] = useState(laundryType !== 'shoes' && currentStep == steps[0]);
  const nextStep = (options: SelectedOptions) => {
    let increment = 1;
    if (currentStep === 'laundryOptions' && options.service === 'dry-only') {
      increment = 2;
    }
    if (currentStep === 'washOptions' && options.service === 'wash-only') {
      increment = 2;
    }
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + increment]);
      return;
    }
    setWashOptions(options);

    if (session.data?.user) {
      router.push(`/order`);
    } else {
      router.push(`/login/order`);
    }
  };

  const prevStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    } else {
      resetOptions();
      router.replace(`/`);
    }
  };

  const handleOptionSelect = (option: keyof SelectedOptions, value: string | boolean | number) => {
    const newOptions = { [option]: value };
    setWashOptions(newOptions);
    nextStep(newOptions);
  };
  const RenderStep = () => {
    switch (currentStep) {
      case 'laundryOptions':
        return (
          <OptionsSelection
            laundryType={laundryType}
            type="laundryOptions"
            onSelect={(value: string) => handleOptionSelect('service', value)}
          />
        );
      case 'washOptions':
        return (
          <OptionsSelection
            laundryType={laundryType}
            type="washOptions"
            onSelect={(value: string) => handleOptionSelect('wash', value)}
          />
        );
      case 'dryOptions':
        return (
          <OptionsSelection
            laundryType={laundryType}
            type="dryOptions"
            onSelect={(value: string) => handleOptionSelect('wash', value)}
          />
        );
      case 'shoePairs':
        return (
          <ShoeCountSelection
            onSelect={(value: number) => handleOptionSelect('shoePairs', value)}
          />
        );
      case 'folding':
        return (
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
            onSelect={(value: boolean) => handleOptionSelect('folding', value)}
          />
        );
      case 'softener':
        return (
          <OptionSelection
            type="softener"
            title="섬유유연제를 무료로 추가할 수 있어요"
            description={
              <p className="font-medium text-label-alternative font-body-1-reading">
                깨끗한 세탁물에 기분 좋은 향까지 받아 보세요
              </p>
            }
            imageUrl="/assets/images/softener.png"
            onSelect={(value: boolean) => handleOptionSelect('softener', value)}
          />
        );

      default:
        null;
    }
  };
  const percentage = ((steps.indexOf(currentStep) + 1) / steps.length) * 100;
  useEffect(() => {
    setWashOptions({ laundryType });
  }, [laundryType, setWashOptions]);
  return (
    <div
      className={clsx('flex h-svh flex-col overflow-auto bg-background-normal-alternative pb-6', {
        'bg-background-normal-normal': currentStep === 'shoePairs',
      })}
    >
      <div className="mb-2.5 px-5 pt-7">
        <ProgressBar percent={percentage} />
      </div>
      <TopNavigation leftClick={prevStep} type="back" />
      <div className="mt-2.5 h-full px-5">
        <RenderStep />
      </div>
      {showDrawer && <InfoDrawer />}
    </div>
  );
}
