import Image from 'next/image';
import Button from '@shared/ui/Button';

export default function OptionSelection({
  type,
  title,
  description,
  imageUrl,
  price,
  onSelect,
}: Readonly<{
  type: 'softener' | 'folding';
  title: string;
  description: React.ReactNode;
  imageUrl: string;
  price: number | null;
  onSelect: (value: boolean, price: number | null) => void;
}>) {
  return (
    <div className="flex flex-col items-center justify-between overflow-scroll">
      <div className="w-full gap-2.5 pl-2">
        <h3 className="font-semibold text-label-strong font-heading-2">{title}</h3>
        {description}
      </div>
      <Image src={imageUrl} width={234} height={234} alt={`${type}-image`} priority />
      <div className="w-full">
        <Button
          onClick={() => onSelect(true, price)}
          state="fillPrimary"
          size="full"
          className="mb-3"
        >
          {type === 'folding' ? '네' : '네 추가할래요'}
        </Button>
        <Button onClick={() => onSelect(false, price)} state="secondary" size="full">
          {type === 'folding' ? '아니요' : '아니요 괜찮아요'}
        </Button>
      </div>
    </div>
  );
}
