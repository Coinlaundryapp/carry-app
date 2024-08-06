import Link from 'next/link';

interface HomeCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}
export default function HomeCard({ title, description, href, icon }: HomeCardProps) {
  return (
    <Link
      href={href}
      className="flex w-full flex-col items-center justify-center rounded-xl bg-white px-[27px] py-[28.5px]"
    >
      {icon}
      <p className="text-center font-semibold text-label-strong font-headline-2">{title}</p>
      <p className="break-keep text-center font-medium text-label-alternative font-caption-1">
        {description}
      </p>
    </Link>
  );
}
