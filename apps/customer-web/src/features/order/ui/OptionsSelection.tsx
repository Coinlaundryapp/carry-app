import Option from '@features/order/ui/Option';
import { LaundryItemType, LaundryOptions, LaundryTask } from '@features/order/types/laundry-type';

export function OptionsSelection({
  options,
  onSelect,
}: Readonly<{
  options: LaundryOptions[];
  laundryItemType: LaundryItemType;
  onSelect: (value: LaundryOptions | LaundryTask) => void;
}>) {
  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-label-strong font-heading-2 ml-2 font-semibold">
        원하는 서비스를 선택해 주세요
      </h3>
      {options.map((option) => {
        if (!option.selectable) {
          return null;
        }
        return <Option key={option.name} option={option} onClick={() => onSelect(option)} />;
      })}
    </div>
  );
}
