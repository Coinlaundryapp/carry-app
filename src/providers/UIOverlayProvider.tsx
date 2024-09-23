'use client';

import { Modal } from '@/components/share/Modal';
import Toast from '@/components/share/Toast';

export default function UIOverlayProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <Toast />
      <Modal />
    </>
  );
}
