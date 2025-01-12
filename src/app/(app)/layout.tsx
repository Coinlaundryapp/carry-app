'use client';

import { useEffect, useRef, useState } from 'react';
import { debounce } from 'es-toolkit';
import ScrollUpButton from '@/components/share/ScrollUpButton/ScrollUpButton';
import { BottomNavigation } from '@/components/share/BottomNavigation';
import Toast from '@/components/share/Toast';
import { Modal } from '@/components/share/Modal';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isVisible, setIsVisible] = useState(false);

  const ref = useRef<HTMLDivElement>(null);
  const scrollToTop = () => {
    ref.current?.scrollTo(0, 0);
  };
  useEffect(() => {
    const handleScroll = debounce(() => {
      if (ref.current) {
        const scrollTop = ref.current.scrollTop;
        setIsVisible(scrollTop > 0);
      }
    }, 100);
    const divElement = ref.current;
    if (divElement) {
      divElement.addEventListener('scroll', handleScroll);
      return () => {
        divElement.removeEventListener('scroll', handleScroll);
      };
    }
  }, [isVisible]);

  return (
    <div className="relative mx-auto flex h-dvh max-w-[480px] flex-col justify-between overflow-hidden bg-white">
      <div className="scrollbar-hide h-full w-full overflow-scroll pb-8" ref={ref}>
        {children}
      </div>

      {isVisible && <ScrollUpButton onClick={scrollToTop} />}
      <BottomNavigation />
      <Toast />
      <Modal />
    </div>
  );
}
