import type { Meta, StoryObj } from '@storybook/react';
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
};

export const Big: Story = {
  args: {
    value: '1',
    size: 'big',
  },
};
