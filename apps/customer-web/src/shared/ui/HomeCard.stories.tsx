import type { Meta, StoryObj } from '@storybook/react';
import { within, expect } from '@storybook/test';
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 제목, 설명 텍스트 렌더링 확인
    await expect(canvas.getByText('세탁 신청')).toBeInTheDocument();
    await expect(canvas.getByText('편하게 맡기고 깨끗하게 받으세요')).toBeInTheDocument();

    // 링크 href 확인
    const link = canvas.getByRole('link');
    await expect(link).toHaveAttribute('href', '/order');
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
