'use client';

import { useState, useEffect } from 'react';
import { debounce } from 'es-toolkit';
import { ArrowUpIcon } from '@assets/icons';

export default function ScrollUpButton() {
  const [isVisible, setIsVisible] = useState(false);

  const handleScroll = debounce(() => {
    if (window.scrollY > 100) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, 200);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed bottom-0 left-1/2 z-50 w-full max-w-[480px] -translate-x-1/2">
      <div className="relative h-[150px] w-full">
        <button
          onClick={scrollToTop}
          className="pointer-events-auto absolute bottom-[104px] right-5 flex h-14 w-14 items-center justify-center rounded-full bg-cool-neutral-95 shadow-lg transition-opacity duration-300"
        >
          <ArrowUpIcon />
        </button>
      </div>
    </div>
  );
}
