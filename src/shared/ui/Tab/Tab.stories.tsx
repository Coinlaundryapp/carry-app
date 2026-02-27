import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within, expect } from '@storybook/test';
import Tab from './Tab';

const meta = {
  title: 'Components/Tab',
  component: Tab,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {
    defaultTab: 'distance',
    data: [
      {
        label: '거리별 배송비',
        content: 'Make changes to your account here.',
        value: 'distance',
      },
      {
        label: '세탁 요금',
        content: 'Change your password here.',
        value: 'price',
      },
    ],
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Tab>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TwoTabs: Story = {
  args: {
    defaultTab: 'distance',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 초기 상태: 첫 번째 탭 컨텐츠 표시
    await expect(canvas.getByText('Make changes to your account here.')).toBeInTheDocument();

    // 두 번째 탭 클릭
    const secondTab = canvas.getByText('세탁 요금');
    await userEvent.click(secondTab);

    // 두 번째 탭 컨텐츠 표시 확인
    await expect(canvas.getByText('Change your password here.')).toBeInTheDocument();
  },
} satisfies Story;
export const ThreeTabs: Story = {
  args: {
    defaultTab: 'tab1',
    data: [
      {
        label: '탭1',
        content: '탭 1',
        value: 'tab1',
      },
      {
        label: '탭2',
        content: '탭 2',
        value: 'tab2',
      },
      {
        label: '탭3',
        content: '탭 3',
        value: 'tab3',
      },
    ],
  },
} satisfies Story;
