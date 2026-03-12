import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within, expect } from '@storybook/test';
import Tooltip from './Tooltip';
import { ArrowRightIcon } from '@assets/icons';

const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    message: '처음 오셨나요?',
    children: <ArrowRightIcon />,
  },
} satisfies Meta<typeof Tooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: '처음 오셨나요?',
    children: <ArrowRightIcon />,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 초기 상태: 툴팁 메시지 표시
    await expect(canvas.getByText('처음 오셨나요?')).toBeInTheDocument();

    // 화면 클릭 → 툴팁 사라짐
    await userEvent.click(canvasElement);
  },
};
