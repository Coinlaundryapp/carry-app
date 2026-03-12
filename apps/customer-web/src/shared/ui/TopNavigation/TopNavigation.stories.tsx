import type { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, within, expect } from '@storybook/test';
import TopNavigation from './TopNavigation';

const meta = {
  title: 'Components/TopNavigation',
  component: TopNavigation,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {
    leftClick: fn(),
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div className="mx-auto h-[200px] w-96 border">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TopNavigation>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Back: Story = {
  args: {
    type: 'back',
    title: 'Title',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // 타이틀 표시 확인
    await expect(canvas.getByText('Title')).toBeInTheDocument();

    // 뒤로가기 버튼 클릭 → leftClick 호출 확인
    const buttons = canvas.getAllByRole('button');
    await userEvent.click(buttons[0]);
    await expect(args.leftClick).toHaveBeenCalled();
  },
};

export const Close: Story = {
  args: {
    type: 'close',
    title: 'Title',
  },
};

export const WithoutTitle: Story = {
  args: {
    type: 'back',
  },
};

export const BackWithoutTitle: Story = {
  args: {
    type: 'back',
  },
};

export const BackWithSearch: Story = {
  args: {
    type: 'back',
    title: 'Title',
    rightClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // 버튼 2개 렌더링 확인 (왼쪽 + 오른쪽)
    const buttons = canvas.getAllByRole('button');
    await expect(buttons).toHaveLength(2);

    // 오른쪽 검색 버튼 클릭 → rightClick 호출 확인
    await userEvent.click(buttons[1]);
    await expect(args.rightClick).toHaveBeenCalled();
  },
};
