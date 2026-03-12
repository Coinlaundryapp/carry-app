import type { Meta, StoryObj } from '@storybook/react';
import { within, expect } from '@storybook/test';
import Menu from './Menu';

const meta = {
  title: 'Components/Menu',
  component: Menu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story: React.ComponentType) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    menu: {
      id: 'account',
      title: '내 계정',
      icon: <span>👤</span>,
      items: [
        { id: 'profile', title: '프로필 설정', path: '/profile' },
        { id: 'address', title: '주소 관리', path: '/address' },
        {
          id: 'service-center',
          title: '고객센터',
          path: 'tel:0212345678',
          rightText: '09:00 ~ 18:00',
        },
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 메뉴 제목 표시 확인
    await expect(canvas.getByText('내 계정')).toBeInTheDocument();

    // 메뉴 아이템 3개 모두 렌더링 확인
    await expect(canvas.getByText('프로필 설정')).toBeInTheDocument();
    await expect(canvas.getByText('주소 관리')).toBeInTheDocument();
    await expect(canvas.getByText('고객센터')).toBeInTheDocument();

    // 고객센터 운영시간 표시 확인
    await expect(canvas.getByText('09:00 ~ 18:00')).toBeInTheDocument();
  },
};

export const WithRightText: Story = {
  args: {
    menu: {
      id: 'order',
      title: '주문 관리',
      icon: <span>📦</span>,
      items: [
        { id: 'orders', title: '주문 내역', path: '/orders', rightText: '3건' },
        { id: 'reviews', title: '리뷰 작성', path: '/reviews', rightText: '미작성 1건' },
      ],
    },
  },
};
