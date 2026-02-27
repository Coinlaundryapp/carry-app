import type { Meta, StoryObj } from '@storybook/react';
import MessageCard from './MessageCard';

const meta = {
  title: 'Components/MessageCard',
  component: MessageCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof MessageCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: '빠른 시간 내에 연락드리겠습니다.',
  },
};

export const LongMessage: Story = {
  args: {
    message: '현재 서비스 지역이 아닙니다. 서비스 지역이 확대되면 알림을 보내드리겠습니다.',
  },
};

export const WithJSX: Story = {
  args: {
    message: (
      <span>
        배송비는 <strong className="text-primary-normal">무료</strong>입니다.
      </span>
    ),
  },
};
