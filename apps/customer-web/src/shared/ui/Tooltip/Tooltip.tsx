'use client';

import { useEffect, useState, useRef } from 'react';
import { InformationCircle, ToolTipBoxIcon } from '@assets/icons';

export default function Tooltip({
  message,
  children,
}: Readonly<{
  message: string;
  children: React.ReactNode;
}>) {
  const [visible, setVisible] = useState(true);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleInteraction = () => {
      setVisible(false);
      document.removeEventListener('mousedown', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };

    // 다양한 이벤트 리스너 추가
    document.addEventListener('mousedown', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      document.removeEventListener('mousedown', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  if (!visible) return <>{children}</>;

  return (
    <div className="relative" ref={tooltipRef}>
      {children}
      <div className="absolute -left-[88px] -top-[40px]">
        <ToolTipBoxIcon className="relative" />
        <p className="absolute left-2.5 top-1.5 font-normal text-white font-label-1-normal">
          {message}
        </p>
      </div>
    </div>
  );
}
