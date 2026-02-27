import type { Meta, StoryObj } from '@storybook/react';
import Alert from './Alert';

const meta = {
  title: 'Components/Alert',
  component: Alert,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {},
  decorators: [
    (Story: React.ComponentType) => (
      <div className="mx-auto w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Alert>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: {
    status: 'success',
    label: '새 배송지가 추가되었습니다.',
  },
} satisfies Story;
export const Done: Story = {
  args: {
    status: 'done',
    label: '정상적으로 탈퇴되었습니다!',
  },
} satisfies Story;
