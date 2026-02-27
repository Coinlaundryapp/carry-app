import Loading from '@shared/ui/Loading';
import { Modal } from '@shared/ui/Modal';
import Toast from '@shared/ui/Toast';
import { Suspense } from 'react';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="safe-area-top relative mx-auto flex h-dvh max-w-[480px] flex-col justify-between overflow-hidden bg-white">
      <div className="scrollbar-hide h-full w-full overflow-scroll">
        <Suspense fallback={<Loading />}>{children}</Suspense>
      </div>
      <Toast />
      <Modal />
    </div>
  );
}
