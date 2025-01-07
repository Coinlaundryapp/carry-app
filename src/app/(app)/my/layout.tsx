import Footer from '@/components/share/Footer/Footer';
import Separator from '@/components/share/Separator/Separator';
import React from 'react';

function layout({ children }: any) {
  return (
    <main>
      {children}
      <Separator variant="horizontal8" />
      <Footer />
    </main>
  );
}

export default layout;
