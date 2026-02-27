import type { Meta, StoryObj } from '@storybook/react';
import HomeCard from './HomeCard';

const meta = {
  title: 'Components/HomeCard',
  component: HomeCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof HomeCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: '세탁 신청',
    description: '편하게 맡기고 깨끗하게 받으세요',
    href: '/order',
    icon: <span className="text-4xl">🧺</span>,
  },
};

export const Delivery: Story = {
  args: {
    title: '배달 현황',
    description: '실시간으로 확인하세요',
    href: '/status',
    icon: <span className="text-4xl">🚗</span>,
  },
};
