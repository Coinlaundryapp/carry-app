import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within, expect } from '@storybook/test';
import CollapsiblePanel from './CollapsiblePanel';
import { AvatarGirlIcon } from '@assets/icons';

const additionalContent = (
  <div className="flex items-center pr-2">
    <div className="flex -space-x-3.5">
      <AvatarGirlIcon />
      <AvatarGirlIcon />
      <AvatarGirlIcon />
    </div>
    <span className="ml-2">
      총 <span className="text-primary-normal">3</span>명
    </span>
  </div>
);

const meta: Meta<typeof CollapsiblePanel> = {
  title: 'Components/CollapsiblePanel',
  component: CollapsiblePanel,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    value: { control: 'text' },
    children: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: '함께하는 멤버',
    value: 'example-value',
    children: 'This is the content inside the collapsible panel.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 제목 표시 확인
    await expect(canvas.getByText('함께하는 멤버')).toBeInTheDocument();

    // 트리거 클릭 → 패널 펼치기
    const trigger = canvas.getByRole('button');
    await userEvent.click(trigger);

    // 컨텐츠 표시 확인
    await expect(
      canvas.getByText('This is the content inside the collapsible panel.'),
    ).toBeInTheDocument();
  },
};

export const Additional: Story = {
  args: {
    title: '함께하는 멤버',
    value: 'example-value',
    additionalContent: additionalContent,
    children: 'This is the content inside the collapsible panel.',
  },
};
