import type { Meta, StoryObj } from '@storybook/react';
import ProgressBar from './ProgressBar';

const meta = {
  title: 'Components/ProgressBar',
  component: ProgressBar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'radio',
      options: ['default', 'blue'],
    },
  },
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
};

export const Percent75: Story = {
  args: {
    percent: 75,
  },
};

export const Blue: Story = {
  args: {
    percent: 60,
    color: 'blue',
  },
};
