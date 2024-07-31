'use client';

import ScrollUpButton from '@/components/ScrollUpButton';
import { BottomNavigation } from '@/components/share/BottomNavigation';
import { useRef } from 'react';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const ref = useRef<HTMLDivElement>(null);
  const scrollToTop = () => {
    ref.current?.scrollTo(0, 0);
  };
  return (
    <div className="relative mx-auto flex h-dvh max-w-[600px] flex-col justify-between overflow-hidden bg-white">
      <div className="h-full w-full overflow-scroll pb-8" ref={ref}>
        {children}
      </div>
      <ScrollUpButton onClick={scrollToTop} />
      <BottomNavigation />
    </div>
  );
}
