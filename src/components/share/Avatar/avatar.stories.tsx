import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './avatar';

const meta = {
  title: 'Components/Avatar',
  component: Avatar.Group,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    sort: {
      control: {
        type: 'radio',
      },
      options: ['asc', 'desc'],
    },
  },
  args: {
    avatarList: [
      '/image/empty_avatar.svg',
      '/image/empty_avatar.svg',
      '/image/empty_avatar.svg',
      '/image/empty_avatar.svg',
      '/image/empty_avatar.svg',
    ],
    sort: 'asc',
  },
} satisfies Meta<typeof Avatar.Group>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
