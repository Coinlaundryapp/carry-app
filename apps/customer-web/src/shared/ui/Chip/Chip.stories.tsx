import type { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, within, expect } from '@storybook/test';
import Chip from './chip';

const meta = {
  title: 'Components/Chip',
  component: Chip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: { onClick: fn() },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: 'Chip',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // 텍스트 표시 확인
    await expect(canvas.getByText('Chip')).toBeInTheDocument();

    // 클릭
    await userEvent.click(canvas.getByText('Chip'));

    // onClick 핸들러 호출 확인
    await expect(args.onClick).toHaveBeenCalled();
  },
};
