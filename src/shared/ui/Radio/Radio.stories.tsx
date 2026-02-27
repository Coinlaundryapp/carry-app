import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { Radio } from './radio';
import { fn } from '@storybook/test';

const meta = {
  title: 'Components/RadioGroup',
  component: ({ value, size }) => (
    <Radio.Group value={value} size={size} onChange={() => {}}>
      <Radio.Button value="1" />
      <Radio.Button value="2" />
    </Radio.Group>
  ),
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: {
        type: 'radio',
      },
      options: ['small', 'big'],
    },
    value: {
      control: {
        type: 'radio',
      },
      options: ['1', '2'],
    },
  },
  args: {
    onChange: fn(),
  },
  decorators: [(story) => <div className="flex gap-4">{story()}</div>],
} satisfies Meta<typeof Radio.Group>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: '1',
    size: 'small',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 라디오 버튼 2개 렌더링 확인
    const radios = canvas.getAllByRole('radio');
    await expect(radios).toHaveLength(2);

    // 첫 번째 라디오가 선택된 상태 확인
    await expect(radios[0]).toBeChecked();
    await expect(radios[1]).not.toBeChecked();
  },
};

export const Big: Story = {
  args: {
    value: '1',
    size: 'big',
  },
};
