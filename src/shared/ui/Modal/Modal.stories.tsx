import type { Meta, StoryObj } from '@storybook/react';
import Modal from './Modal';
import { useModalStore } from '@shared/model/modal-store';

const meta = {
  title: 'Components/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Modal>;

export default meta;

type Story = StoryObj<typeof meta>;
const render = () => {
  const openModal = useModalStore((state) => state.openModal);

  const handleOpenBasicModal = () => {
    openModal({
      type: 'basic',
      title: '서비스를 이용할 수 없어요',
      closeText: '확인',
    });
  };
  const handleOpenBasicModalWithDescription = () => {
    openModal({
      type: 'basic',
      title: '서비스를 이용할 수 없어요',
      description: '서비스 이용에 제한이 있습니다. 잠시 후 다시 시도해주세요.',
      closeText: '확인',
    });
  };
  const handleOpenBasicModalWithImage = () => {
    openModal({
      type: 'basic',
      title: '서비스를 이용할 수 없어요',
      closeText: '확인',
      image: 'check',
    });
  };
  const handleOpenConfirmModal = () => {
    openModal({
      type: 'confirm',
      title: '서비스를 이용할 수 없어요',
      closeText: '취소',
      confirmText: '허용',
      onConfirm() {
        alert('confirm');
      },
    });
  };
  const handleOpenConfirmModalWithDescription = () => {
    openModal({
      type: 'confirm',
      title: '서비스를 이용할 수 없어요',
      description: '위치를 허용해주시면 서비스를 이용할 수 있어요',
      closeText: '취소',
      confirmText: '허용',
      onConfirm() {
        alert('confirm');
      },
    });
  };
  const handleOpenConfirmModalWithImage = () => {
    openModal({
      type: 'confirm',
      title: '서비스를 이용할 수 없어요',
      description: '위치를 허용해주시면 서비스를 이용할 수 있어요',
      closeText: '취소',
      confirmText: '허용',
      image: 'sad',
      onConfirm() {
        alert('confirm');
      },
    });
  };

  return (
    <>
      <div className="flex gap-2">
        <div className="flex flex-col gap-2">
          <button
            onClick={handleOpenBasicModal}
            className="rounded bg-blue-500 px-4 py-2 text-white"
          >
            basic modal
          </button>
          <button
            onClick={handleOpenBasicModalWithDescription}
            className="rounded bg-blue-500 px-4 py-2 text-white"
          >
            basic modal with description
          </button>
          <button
            onClick={handleOpenBasicModalWithImage}
            className="rounded bg-blue-500 px-4 py-2 text-white"
          >
            basic modal with image
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={handleOpenConfirmModal}
            className="rounded bg-blue-500 px-4 py-2 text-white"
          >
            confirm modal
          </button>
          <button
            onClick={handleOpenConfirmModalWithDescription}
            className="rounded bg-blue-500 px-4 py-2 text-white"
          >
            confirm modal with description
          </button>
          <button
            onClick={handleOpenConfirmModalWithImage}
            className="rounded bg-blue-500 px-4 py-2 text-white"
          >
            confirm modal with image
          </button>
        </div>
      </div>
      <Modal />
    </>
  );
};
export const Usage: Story = {
  render,
};
