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
      <p className="text-label-strong font-headline-2 text-center font-semibold">{title}</p>
      <p className="text-label-alternative font-caption-1 break-keep text-center font-medium">
        {description}
      </p>
    </Link>
  );
}
