import type { Meta, StoryObj } from '@storybook/react';
import ScrollUpButton from './ScrollUpButton';

const meta = {
  title: 'Components/ScrollUpButton',
  component: ScrollUpButton,
  parameters: {
    layout: 'centered',
  },
  args: { onClick: () => {} },
} satisfies Meta<typeof ScrollUpButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Template: Story = {
  args: { onClick: () => {} },
};
