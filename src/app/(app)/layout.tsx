import { BottomNavigation } from '@/components/share/BottomNavigation';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto flex h-dvh max-w-[600px] flex-col justify-between overflow-hidden bg-white">
      <div className="h-full overflow-scroll pb-8">{children}</div>
      <BottomNavigation />
    </div>
  );
}
