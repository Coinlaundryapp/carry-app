import type { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, within, expect } from '@storybook/test';
import ScrollUpButton from './ScrollUpButton';

const meta = {
  title: 'Components/ScrollUpButton',
  component: ScrollUpButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: { onClick: fn() },
} satisfies Meta<typeof ScrollUpButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    // 버튼 클릭
    await userEvent.click(button);

    // onClick 핸들러 호출 확인
    await expect(args.onClick).toHaveBeenCalled();
  },
};
