'use client';

import { Alert } from '@/components/share/Alert';
import { useToastStore } from '@/store/toast-store';
import React, { useEffect } from 'react';

export default function Toast() {
  const { toasts, removeToast } = useToastStore();

  useEffect(() => {
    toasts.forEach((toast) => {
      const timer = setTimeout(() => {
        removeToast(toast.id);
      }, toast.duration);

      return () => clearTimeout(timer);
    });
  }, [toasts, removeToast]);

  if (toasts.length === 0) return null;
  return (
    <div className="absolute top-4 z-50 flex w-full flex-col gap-2 px-4">
      {toasts.map((toast) => (
        <Alert key={toast.id} status={toast.type} label={toast.message} />
      ))}
    </div>
  );
}
