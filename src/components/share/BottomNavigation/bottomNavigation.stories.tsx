import type { Meta, StoryObj } from '@storybook/react';
import { BottomNavigation } from './bottomNavigation';

const meta = {
  title: 'Components/BottomNavigation',
  component: BottomNavigation,
  parameters: {},
  argTypes: {},
  args: {},
} satisfies Meta<typeof BottomNavigation>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
