import type { Meta, StoryObj } from '@storybook/react';
import { within, expect } from '@storybook/test';
import Loading from './Loading';

const meta = {
  title: 'Components/Loading',
  component: Loading,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Loading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 기본 제목 텍스트 렌더링 확인
    await expect(canvas.getByText('잠시만 기다려 주세요!')).toBeInTheDocument();

    // 기본 설명 텍스트 렌더링 확인
    await expect(canvas.getByText('해당 페이지로 이동하고 있어요')).toBeInTheDocument();
  },
};

export const CustomText: Story = {
  args: {
    text: '주문 정보를 불러오는 중이에요',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 커스텀 텍스트 렌더링 확인
    await expect(canvas.getByText('주문 정보를 불러오는 중이에요')).toBeInTheDocument();
  },
};
