import type { Meta, StoryObj } from '@storybook/react';
import Tooltip from './Tooltip';
import { ArrowRightIcon } from '@assets/icons';

const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    message: '처음 오셨나요?',
    children: <ArrowRightIcon />,
  },
} satisfies Meta<typeof Tooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Template: Story = {
  args: {
    message: '처음 오셨나요?',
    children: <ArrowRightIcon />,
  },
};
