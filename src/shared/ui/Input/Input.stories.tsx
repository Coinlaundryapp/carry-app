import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, within, expect } from '@storybook/test';
import { Input, InputProps } from './Input';
import { InputErrorIcon, InputSuccessIcon, SearchIcon } from '@assets/icons';

const meta = {
  title: 'components/Input',
  component: Input,
  tags: ['autodocs'],
  args: {
    type: 'text',
    status: 'default',
    placeholder: 'Placeholder',
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div className="mx-auto w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

const render = (args: InputProps) => {
  const [value, setValue] = useState(args.value);
  args.value = value;
  args.onClear = fn(() => setValue(''));
  args.onChange = fn((e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value));
  return <Input {...args} />;
};

export const Default: Story = {
  args: {
    value: '',
    status: 'default',
  },
  render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');

    // 초기 상태: 빈 값
    await expect(input).toHaveValue('');

    // 텍스트 입력
    await userEvent.type(input, '안녕하세요');
    await expect(input).toHaveValue('안녕하세요');
  },
};

export const Success: Story = {
  args: {
    value: 'lorem@ipsum.com',
    status: 'success',
    statusMessage: 'Success message',
    successIcon: <InputSuccessIcon />,
  },
  render,
};

export const Error: Story = {
  args: {
    value: 'lorem@ipsum.com',
    status: 'error',
    statusMessage: 'Error message',
    errorIcon: <InputErrorIcon />,
  },
  render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 에러 메시지 표시 확인
    await expect(canvas.getByText('Error message')).toBeInTheDocument();
  },
};

export const Done: Story = {
  args: {
    value: '유효한 텍스트 입력 완료',
    status: 'done',
  },
  render,
};
export const Search: Story = {
  args: {
    type: 'text',
    status: 'default',
    placeholder: '검색어를 입력하세요',
    leftIcon: <SearchIcon />,
  },
  render,
};
