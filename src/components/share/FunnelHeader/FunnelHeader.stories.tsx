import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import FunnelHeader from './FunnelHeader';

const meta: Meta<typeof FunnelHeader> = {
  title: 'Components/FunnelHeader',
  component: FunnelHeader,
  argTypes: {
    title: { control: 'text' },
    subTitle: { control: 'text' },
    containerClassName: { control: 'text' },
    questionClassName: { control: 'text' },
    answerClassName: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'What is your name?',
    subTitle: 'My name is John Doe.',
    containerClassName: 'p-4 bg-gray-100 rounded-lg',
    questionClassName: 'text-xl font-bold',
    answerClassName: 'text-lg text-gray-700',
  },
};
