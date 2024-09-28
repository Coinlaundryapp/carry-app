import { LaundryOptions } from '@/types/laundry-type';
import { formatNumberWithCommas } from '@/utils/format';

export default function Option({
  option,
  onClick,
}: Readonly<{
  option: LaundryOptions;
  onClick: () => void;
}>) {
  return (
    <button
      className="flex h-[112px] w-full items-center justify-between rounded-lg bg-background-normal-normal p-6"
      onClick={onClick}
    >
      <div className="flex flex-col justify-start gap-1 text-left">
        <p className="font-bold text-label-normal font-headline-1">{option.name}</p>
        {option.description && (
          <p className="font-medium text-label-alternative font-label-1-normal">
            {option.description}
          </p>
        )}
      </div>
      <div className="flex flex-col items-end gap-2">
        {option.icon}
        {option.price && (
          <span className="font-semibold text-[#EB2F96] font-body-1-normal">
            ~{formatNumberWithCommas(option.price)}원
          </span>
        )}
      </div>
    </button>
  );
}
