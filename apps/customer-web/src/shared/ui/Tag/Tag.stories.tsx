import type { Meta, StoryObj } from '@storybook/react';
import { within, expect } from '@storybook/test';
import Tag from './Tag';

const meta = {
  title: 'Components/Tag',
  component: Tag,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    label: 'Primary',
    color: 'primary',
  },
} satisfies Meta<typeof Tag>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    label: 'Primary',
    color: 'primary',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 라벨 텍스트 렌더링 확인
    await expect(canvas.getByText('Primary')).toBeInTheDocument();
  },
} satisfies Story;

export const Green: Story = {
  args: {
    label: 'Green',
    color: 'green',
  },
} satisfies Story;

export const Cyan: Story = {
  args: {
    label: 'Cyan',
    color: 'cyan',
  },
} satisfies Story;

export const Blue: Story = {
  args: {
    label: 'Blue',
    color: 'blue',
  },
} satisfies Story;

export const Gray: Story = {
  args: {
    label: 'Gray',
    color: 'gray',
  },
} satisfies Story;

export const Red: Story = {
  args: {
    label: 'Red',
    color: 'red',
  },
} satisfies Story;

export const Black: Story = {
  args: {
    label: 'Black',
    color: 'black',
  },
} satisfies Story;
