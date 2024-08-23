import { Modal } from '@/components/share/Modal';
import Toast from '@/components/share/Toast';

const LocaleLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-full w-full">
      {children}
      <Modal />
      <Toast />
    </div>
  );
};

export default LocaleLayout;
