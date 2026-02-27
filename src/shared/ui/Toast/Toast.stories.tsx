import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within, expect } from '@storybook/test';
import { useToastStore } from '@shared/model/toast-store';
import Toast from './Toast';

type ToastArgs = {
  message: string;
  type: 'success' | 'done' | 'error';
  duration: number;
};

const meta: Meta<ToastArgs> = {
  title: 'Components/Toast',
  component: Toast,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    message: 'Hello, World!',
    type: 'success',
    duration: 3000,
  },
};

export default meta;

type Story = StoryObj<ToastArgs>;

const render = (args: ToastArgs) => {
  const addToast = useToastStore((state) => state.addToast);
  const handleClick = () => {
    addToast({ message: args.message, type: args.type, duration: args.duration });
  };
  return (
    <div className="relative flex h-80 w-96 items-center justify-center bg-slate-200">
      <button onClick={handleClick}>Open</button>
      <Toast />
    </div>
  );
};
export const Success: Story = {
  render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open 버튼 클릭
    const openButton = canvas.getByText('Open');
    await userEvent.click(openButton);

    // 토스트 메시지 표시 확인
    await expect(canvas.getByText('Hello, World!')).toBeInTheDocument();
  },
};
export const Done: Story = {
  args: {
    type: 'done',
  },
  render,
};

export const Error: Story = {
  args: {
    type: 'error',
    message: '오류가 발생했습니다.',
  },
  render,
};
