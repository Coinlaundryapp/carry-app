'use client';

import { ToolTipBoxIcon } from '@assets/icons';
import { useEffect, useState } from 'react';

export default function Tooltip({
  message,
  children,
}: {
  message: string;
  children: React.ReactNode;
}) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const handleTouchEvent = () => {
      setVisible(false);
      document.removeEventListener('touchstart', handleTouchEvent);
    };
    document.addEventListener('touchstart', handleTouchEvent);
  }, []);

  return (
    <div className="relative">
      {children}
      {visible && (
        <div className="absolute -left-[88px] -top-[40px]">
          <ToolTipBoxIcon className="relative" />
          <p className="absolute left-2.5 top-1.5 font-normal text-white font-label-1-normal">
            {message}
          </p>
        </div>
      )}
    </div>
  );
}
