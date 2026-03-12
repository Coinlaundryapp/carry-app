import { LaundryOptions } from '@features/order/types/laundry-type';
import { formatNumberWithCommas } from '@shared/lib/format';

export default function Option({
  option,
  onClick,
}: Readonly<{
  option: LaundryOptions;
  onClick: () => void;
}>) {
  return (
    <button
      className="bg-background-normal-normal flex h-[112px] w-full items-center justify-between rounded-lg p-6"
      onClick={onClick}
    >
      <div className="flex flex-col justify-start gap-1 text-left">
        <p className="text-label-normal font-headline-1 font-bold">{option.name}</p>
        {option.description && (
          <p className="text-label-alternative font-label-1-normal font-medium">
            {option.description}
          </p>
        )}
      </div>
      <div className="flex flex-col items-end gap-2">
        {option.icon}
        {option.price && (
          <span className="font-body-1-normal font-semibold text-[#EB2F96]">
            ~{formatNumberWithCommas(option.price)}원
          </span>
        )}
      </div>
    </button>
  );
}
