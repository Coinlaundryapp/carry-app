import { BottomNavigation } from '@/components/share/BottomNavigation';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-full bg-white">
      <div className="bg-white pb-[120px]">{children}</div>
      <BottomNavigation />
    </div>
  );
}
