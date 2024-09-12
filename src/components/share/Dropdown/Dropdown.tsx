import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/share/ui/select';
import { RadioOffIcon, RadioOnIcon } from '@assets/icons';
import { cn } from '@/lib/utils';

export interface DropdownProps {
  data: {
    value: string;
    label: string;
  }[];
  value: string;
  placeholder: string;
  indicator: 'check' | 'radio';
  className?: string;
  type?: 'default' | 'time';
  onChange: (value: string) => void;
}

function RadioIndicator({ checked }: Readonly<{ checked: boolean }>) {
  if (checked) {
    return <RadioOnIcon className="h-6 w-6" />;
  }
  return <RadioOffIcon className="h-6 w-6" />;
}

export default function Dropdown({
  data,
  value,
  placeholder,
  indicator = 'check',
  type = 'default',
  className,
  onChange,
}: Readonly<DropdownProps>) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn(value === '' && 'text-label-assistive', className)}>
        <p
          className={cn('truncate font-medium text-label-neutral font-label-1-normal', {
            'font-label-1-normal': type === 'time',
            'text-label-assistive': value === '',
          })}
        >
          {value === '' ? placeholder : data.find((item) => item.value === value)?.label}
        </p>
      </SelectTrigger>
      <SelectContent className={cn(type === 'time' && 'font-label-1-normal')}>
        {data.map((item) => (
          <SelectItem
            key={item.value}
            value={item.value}
            className={cn(item.value === value && 'text-primary-normal')}
          >
            {indicator === 'radio' && <RadioIndicator checked={item.value === value} />}
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
