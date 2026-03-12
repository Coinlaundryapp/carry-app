import type { Meta, StoryObj } from '@storybook/react';
import { within, expect } from '@storybook/test';
import Footer from './Footer';

const meta = {
  title: 'Components/Footer',
  component: Footer,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story: React.ComponentType) => (
      <div className="mx-auto max-w-[480px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 회사 정보 텍스트 렌더링 확인
    await expect(canvas.getByText('캐리')).toBeInTheDocument();

    // 하단 링크 렌더링 확인
    await expect(canvas.getByText('이용약관')).toBeInTheDocument();
    await expect(canvas.getByText('개인정보 처리방침')).toBeInTheDocument();

    // 링크 요소 확인
    const links = canvas.getAllByRole('link');
    await expect(links).toHaveLength(2);
  },
};
