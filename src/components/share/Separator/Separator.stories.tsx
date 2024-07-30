import type { Meta, StoryObj } from '@storybook/react';
import Separator from './Separator';

const meta = {
  title: 'Components/Separator',
  component: Separator,
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {},
  decorators: [
    (Story: React.ComponentType) => (
      <div className="mx-auto flex h-14 w-96 items-center justify-center border border-black">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Separator>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Horizontal8: Story = {
  args: {
    variant: 'horizontal8',
  },
};
export const Horizontal: Story = {
  args: {
    variant: 'horizontal',
  },
};
export const Vertical: Story = {
  args: {
    variant: 'vertical',
  },
};
export const HorizontalWithPadding: Story = {
  args: {
    variant: 'horizontal',
    className: 'mx-4',
  },
};
