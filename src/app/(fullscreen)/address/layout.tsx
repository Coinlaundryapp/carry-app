import BackHead from '@/components/share/BackHead';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative mx-auto flex h-dvh max-w-[600px] flex-col justify-between overflow-hidden bg-white">
      <BackHead title="배송지 추가" />
      {children}
    </div>
  );
}
