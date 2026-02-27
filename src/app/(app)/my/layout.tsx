import Footer from '@shared/ui/Footer/Footer';
import Separator from '@shared/ui/Separator/Separator';
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
