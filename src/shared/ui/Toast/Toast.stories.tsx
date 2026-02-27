import type { Meta, StoryObj } from '@storybook/react';
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
};
export const Done: Story = {
  args: {
    type: 'done',
  },
  render,
};
