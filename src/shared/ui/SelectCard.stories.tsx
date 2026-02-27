import type { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, within, expect } from '@storybook/test';
import SelectCard from './SelectCard';

const meta = {
  title: 'Components/SelectCard',
  component: SelectCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    clickHandler: fn(),
  },
} satisfies Meta<typeof SelectCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div className="flex flex-col items-center justify-center gap-2">
        <span className="text-4xl">👕</span>
        <p className="font-semibold">단벌 세탁</p>
      </div>
    ),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // 텍스트 렌더링 확인
    await expect(canvas.getByText('단벌 세탁')).toBeInTheDocument();

    // 카드 클릭 → clickHandler 호출 확인
    await userEvent.click(canvas.getByText('단벌 세탁'));
    await expect(args.clickHandler).toHaveBeenCalled();
  },
};
