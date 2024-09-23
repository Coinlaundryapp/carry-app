'use client';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative mx-auto flex h-svh max-w-[480px] flex-col justify-between overflow-hidden bg-white">
      {children}
    </div>
  );
}
