import { ReactNode } from 'react';
import Link from 'next/link';
import { MenuChevronRightIcon } from '@assets/icons';

interface MenuItem {
  id: string;
  title: string;
  path: string;
  rightText?: string;
}

interface MenuProps {
  id: string;
  title: string;
  icon: ReactNode;
  items: MenuItem[];
}

// MenuItem 컴포넌트
function MenuListItem({ item }: Readonly<{ item: MenuItem }>) {
  if (item.id === 'service-center') {
    return (
      <a href={item.path} className="flex w-full items-center justify-between">
        <span className="text-label-neutral font-body-1-normal font-semibold">{item.title}</span>
        <span className="flex items-center">
          {item.rightText && (
            <span className="text-primary-normal font-label-1-normal mr-3 rounded-md bg-cyan-50 px-2.5 py-1 font-semibold">
              {item.rightText}
            </span>
          )}
          <MenuChevronRightIcon />
        </span>
      </a>
    );
  }
  return (
    <Link href={item.path} className="flex w-full items-center justify-between">
      <span className="text-label-neutral font-body-1-normal font-semibold">{item.title}</span>
      <span className="flex items-center">
        {item.rightText && (
          <span className="text-primary-normal font-label-1-normal mr-3 rounded-md bg-cyan-50 px-2.5 py-1 font-semibold">
            {item.rightText}
          </span>
        )}
        <MenuChevronRightIcon />
      </span>
    </Link>
  );
}

export default function Menu({ menu }: Readonly<{ menu: MenuProps }>) {
  return (
    <div>
      <div className="mb-5 flex items-center gap-1">
        {menu.icon}
        <h2 className="text-label-normal font-headline-1 font-semibold">{menu.title}</h2>
      </div>
      <div className="flex flex-col gap-5">
        {menu.items.map((item) => (
          <MenuListItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
