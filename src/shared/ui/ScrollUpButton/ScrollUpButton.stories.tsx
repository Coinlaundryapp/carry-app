import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
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

export const Default: Story = {};
