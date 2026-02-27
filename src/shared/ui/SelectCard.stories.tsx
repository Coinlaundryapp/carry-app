import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
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
};
