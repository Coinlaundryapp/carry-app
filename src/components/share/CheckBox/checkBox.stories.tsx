import type { Meta, StoryObj } from '@storybook/react';
import { CheckBox } from './checkBox';
import { fn } from '@storybook/test';

const meta = {
  title: 'Components/CheckBox',
  component: CheckBox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    checked: { control: 'boolean' },
  },
  args: {
    onClick: fn(),
  },
} satisfies Meta<typeof CheckBox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const CheckBoxWithLabel: Story = {
  args: {
    checked: true,
    label: '텍스트',
  },
};

export const Default: Story = {
  args: {
    checked: false,
  },
};
