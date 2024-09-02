export default function Option({
  name,
  description,
  price,
  icon,
  onClick,
}: Readonly<{
  name: string;
  description?: string;
  price: string;
  icon: React.ReactNode;
  onClick: () => void;
}>) {
  return (
    <button
      className="flex w-full items-center justify-between rounded-lg bg-background-normal-normal p-6"
      onClick={onClick}
    >
      <div>
        <span className="font-bold text-label-normal font-headline-1">{name}</span>
        {description && (
          <span className="font-medium text-label-alternative font-label-1-normal">
            {description}
          </span>
        )}
      </div>
      <div className="flex flex-col items-end gap-2">
        {icon}
        <span className="font-semibold text-[#EB2F96] font-body-1-normal">{price}</span>
      </div>
    </button>
  );
}
