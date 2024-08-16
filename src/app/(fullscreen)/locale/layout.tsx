import { Modal } from '@/components/share/Modal';

const LocaleLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-full w-full">
      {children}
      <Modal />
    </div>
  );
};

export default LocaleLayout;
