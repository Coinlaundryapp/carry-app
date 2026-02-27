import type { Meta, StoryObj } from '@storybook/react';
import { CheckBox } from './checkBox';
import { fn, userEvent, within, expect } from '@storybook/test';

const meta = {
  title: 'Components/CheckBox',
  component: CheckBox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    checked: { control: 'boolean' },
  },
  args: {
    onClick: fn(),
  },
} satisfies Meta<typeof CheckBox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const CheckBoxWithLabel: Story = {
  args: {
    checked: true,
    label: '텍스트',
    textClassName: '',
  },
};

export const Default: Story = {
  args: {
    checked: false,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox');

    // 초기 상태: 미체크
    await expect(checkbox).not.toBeChecked();

    // 클릭
    await userEvent.click(checkbox);

    // onClick 핸들러 호출 확인
    await expect(args.onClick).toHaveBeenCalled();
  },
};
