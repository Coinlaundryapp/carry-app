import Option from '@/components/order/Option';
import { DryIcon, HotWaterIcon, WaterIcon } from '@assets/icons';

type LaundryType = 'general' | 'bedding' | 'mixed' | 'shoes';
type OptionType = 'laundryOptions' | 'washOptions' | 'dryOptions';

const serviceOptions = [
  {
    name: '세탁 + 건조',
    icon: (
      <div className="flex gap-1">
        <WaterIcon />
        <DryIcon />
      </div>
    ),
    value: 'wash-and-dry',
  },
  {
    name: '건조만',
    icon: <DryIcon />,
    value: 'dry-only',
  },
  {
    name: '세탁만',
    icon: <WaterIcon />,
    value: 'wash-only',
  },
];

const washOptions = [
  {
    name: '표준 코스',
    description: '냉수',
    price: '4,500원~',
    icon: <WaterIcon />,
    value: 'standard-wash',
  },
  {
    name: '온수 코스',
    description: '40도',
    price: '5,000원~',
    icon: <HotWaterIcon />,
    value: 'hot-water-wash',
  },
];

const dryOptions = [
  {
    name: '저온 건조',
    description: '30분',
    price: '4,000원',
    icon: <DryIcon />,
    value: 'low-temp-dry',
  },
  {
    name: '고온 건조',
    description: '30분',
    price: '4,000원',
    icon: <DryIcon />,
    value: 'high-temp-dry',
  },
];

const allowedServiceOptions: Record<LaundryType, string[]> = {
  general: ['wash-and-dry', 'dry-only', 'wash-only'],
  bedding: ['wash-and-dry', 'dry-only'],
  mixed: ['wash-and-dry'],
  shoes: ['wash-and-dry'],
};
const allowedWashOptions: Record<LaundryType, string[]> = {
  general: ['standard-wash', 'hot-water-wash'],
  bedding: ['standard-wash', 'hot-water-wash'],
  mixed: ['standard-wash', 'hot-water-wash'],
  shoes: ['standard-wash'],
};

function filterOptions(options: any[], type: OptionType, laundryType: LaundryType) {
  if (type === 'laundryOptions') {
    return options.filter((option) => allowedServiceOptions[laundryType].includes(option.value));
  }
  if (type === 'washOptions') {
    return options.filter((option) => allowedWashOptions[laundryType].includes(option.value));
  }
  return options;
}

export function OptionsSelection({
  type,
  laundryType,
  onSelect,
}: Readonly<{
  type: OptionType;
  laundryType: LaundryType;
  onSelect: (value: string) => void;
}>) {
  const allOptions =
    type === 'laundryOptions' ? serviceOptions : type === 'washOptions' ? washOptions : dryOptions;

  const filteredOptions = filterOptions(allOptions, type, laundryType);

  return (
    <div className="flex flex-col gap-6">
      <h3 className="ml-2 font-semibold text-label-strong font-heading-2">
        원하는 서비스를 선택해 주세요
      </h3>
      {filteredOptions.map((option) => (
        <Option
          key={option.name}
          name={option.name}
          price={option.price}
          icon={option.icon}
          onClick={() => onSelect(option.value)}
        />
      ))}
    </div>
  );
}
