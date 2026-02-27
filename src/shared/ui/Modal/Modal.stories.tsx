import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within, expect } from '@storybook/test';
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 1) basic modal 열기
    const basicButton = canvas.getByText('basic modal');
    await userEvent.click(basicButton);

    // 모달 제목 확인
    await expect(canvas.getByText('서비스를 이용할 수 없어요')).toBeInTheDocument();

    // 확인 버튼 클릭으로 닫기
    const closeButton = canvas.getByText('확인');
    await userEvent.click(closeButton);

    // 2) confirm modal 열기
    const confirmButton = canvas.getByText('confirm modal');
    await userEvent.click(confirmButton);

    // 취소/허용 버튼 모두 존재 확인
    await expect(canvas.getByText('취소')).toBeInTheDocument();
    await expect(canvas.getByText('허용')).toBeInTheDocument();

    // 취소 버튼으로 닫기
    await userEvent.click(canvas.getByText('취소'));
  },
};
