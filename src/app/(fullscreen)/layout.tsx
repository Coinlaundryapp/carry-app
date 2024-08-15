import { Modal } from '@/components/share/Modal';
import Toast from '@/components/share/Toast';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative mx-auto flex h-dvh max-w-[600px] flex-col justify-between overflow-hidden bg-white">
      <div className="h-full w-full overflow-scroll pb-8">{children}</div>
      <Toast />
      <Modal />
    </div>
  );
}
