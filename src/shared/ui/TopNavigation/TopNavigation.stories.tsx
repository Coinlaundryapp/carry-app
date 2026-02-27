import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import TopNavigation from './TopNavigation';

const meta = {
  title: 'Components/TopNavigation',
  component: TopNavigation,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {
    leftClick: fn(),
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div className="mx-auto h-[200px] w-96 border">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TopNavigation>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Back: Story = {
  args: {
    type: 'back',
    title: 'Title',
  },
};

export const Close: Story = {
  args: {
    type: 'close',
    title: 'Title',
  },
};

export const WithoutTitle: Story = {
  args: {
    type: 'back',
  },
};

export const BackWithoutTitle: Story = {
  args: {
    type: 'back',
  },
};

export const BackWithSearch: Story = {
  args: {
    type: 'back',
    title: 'Title',
    rightClick: fn(),
  },
};
