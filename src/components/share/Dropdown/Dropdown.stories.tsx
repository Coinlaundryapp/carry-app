import type { Meta, StoryObj } from '@storybook/react';
import Dropdown, { DropdownProps } from './Dropdown';
import { useState } from 'react';
import { fn } from '@storybook/test';
import { pretendard } from '@/app/layout';
import clsx from 'clsx';

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
    placeholder: '카드사를 선택해 주세요카드사를 선택해 주세요카드사를 선택해 주세요',
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
  const [value, setValue] = useState(args.value);
  args.value = value;
  args.onChange = fn((value: string) => setValue(value));
  return <Dropdown {...args} />;
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
