import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { fn, expect, within } from '@storybook/test';
import clsx from 'clsx';
import Dropdown, { DropdownProps } from './Dropdown';
import { pretendard } from '@/font/myLocalFont';

const meta = {
  title: 'Components/Dropdown',
  component: Dropdown,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    data: [
      { value: '1', label: 'KB 국민카드' },
      { value: '2', label: '롯데카드' },
      { value: '3', label: '우리카드' },
      { value: '4', label: '신한카드' },
      { value: '5', label: '현대카드' },
      { value: '6', label: '삼성카드' },
      { value: '7', label: '하나카드' },
      { value: '8', label: '비씨카드' },
      { value: '9', label: 'NH농협카드' },
      { value: '10', label: '씨티카드' },
    ],
    value: '',
    indicator: 'check',
    onChange: fn(),
    placeholder: '카드사를 선택해 주세요',
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div className={clsx(pretendard.className, 'mx-auto h-full w-96')}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Dropdown>;

export default meta;

type Story = StoryObj<typeof meta>;

const render = (args: DropdownProps) => {
  const [value, setValue] = useState(args.value ?? '');
  return <Dropdown {...args} value={value} onChange={(v: string) => setValue(v)} />;
};

export const Check: Story = {
  args: {
    indicator: 'check',
  },
  render,
};

export const Radio: Story = {
  args: {
    indicator: 'radio',
  },
  render,
};

export const Time: Story = {
  args: {
    type: 'time',
    indicator: 'check',
    placeholder: '시간을 선택해 주세요',
    data: [
      { value: '09:00', label: '09:00' },
      { value: '10:00', label: '10:00' },
      { value: '11:00', label: '11:00' },
      { value: '12:00', label: '12:00' },
    ],
  },
  render,
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: '선택 불가',
  },
  render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // placeholder 텍스트 표시 확인
    await expect(canvas.getByText('선택 불가')).toBeInTheDocument();

    // trigger가 disabled 상태인지 확인
    const trigger = canvas.getByRole('combobox');
    await expect(trigger).toBeDisabled();
  },
};
