import type { Meta, StoryObj } from '@storybook/react';
import ProgressBar from './ProgressBar';

const meta = {
  title: 'Components/ProgressBar',
  component: ProgressBar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    percent: 25,
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProgressBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Percent50: Story = {
  args: {
    percent: 50,
  },
} satisfies Story;
export const Percent75: Story = {
  args: {
    percent: 75,
  },
} satisfies Story;
