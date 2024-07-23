import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Button from './Button';
import { fn } from '@storybook/test';

const meta: Meta<typeof Button> = {
  title: 'Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    backgroundColor: { control: 'color' },
    borderColor: { control: 'text' },
    color: { control: 'color' },
    size: {
      control: 'radio',
      options: ['small', 'medium', 'large'],
    },
    text: {
      control: 'text',
    },
  },
  args: {
    onClick: fn(),
    type: 'button',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Large: Story = {
  args: {
    text: 'Large Button',
    backgroundColor: 'bg-primary-normal text-static-white',
    color: '#FFFFFF',
    size: 'large',
  },
};

export const Medium: Story = {
  args: {
    text: 'Medium Button',
    backgroundColor: 'bg-primary-normal text-static-white',
    color: '#FFFFFF',
    size: 'medium',
  },
};

export const Small: Story = {
  args: {
    text: 'Small Button',
    backgroundColor: 'bg-primary-normal text-static-white',
    color: '#FFFFFF',
    size: 'small',
  },
};
