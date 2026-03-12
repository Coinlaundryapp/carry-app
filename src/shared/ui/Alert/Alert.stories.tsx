import type { Meta, StoryObj } from '@storybook/react';
import { within, expect } from '@storybook/test';
import Alert from './Alert';

const meta = {
  title: 'Components/Alert',
  component: Alert,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {},
  decorators: [
    (Story: React.ComponentType) => (
      <div className="mx-auto w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Alert>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: {
    status: 'success',
    label: '새 배송지가 추가되었습니다.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 라벨 텍스트 렌더링 확인
    await expect(canvas.getByText('새 배송지가 추가되었습니다.')).toBeInTheDocument();
  },
};

export const Done: Story = {
  args: {
    status: 'done',
    label: '정상적으로 탈퇴되었습니다!',
  },
};

export const Error: Story = {
  args: {
    status: 'error',
    label: '오류가 발생했습니다. 다시 시도해주세요.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 에러 라벨 텍스트 렌더링 확인
    await expect(canvas.getByText('오류가 발생했습니다. 다시 시도해주세요.')).toBeInTheDocument();
  },
};
