import type { Meta, StoryObj } from '@storybook/react';
import { within, expect } from '@storybook/test';
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Radix ProgressBar의 role="progressbar" 렌더링 확인
    const progressbar = canvas.getByRole('progressbar');
    await expect(progressbar).toBeInTheDocument();

    // aria-valuenow 속성으로 값 확인
    await expect(progressbar).toHaveAttribute('aria-valuenow', '50');
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
