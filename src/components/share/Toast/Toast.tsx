'use client';

import { Alert } from '@/components/share/Alert';
import { useToastStore } from '@/store/toast-store';
import React, { useEffect } from 'react';

export default function Toast() {
  const { toast, removeToast } = useToastStore();

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        removeToast();
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [toast, removeToast]);

  if (!toast) return null;

  return (
    <div className="absolute top-4 z-50 flex w-full flex-col gap-2 px-4">
      <Alert key={toast.id} status={toast.type} label={toast.message} />
    </div>
  );
}
