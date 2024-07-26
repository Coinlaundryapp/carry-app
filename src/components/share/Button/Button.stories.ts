import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Button from './Button';
import { fn } from '@storybook/test';

const meta: Meta<typeof Button> = {
  title: 'Button',
  component: Button,
  argTypes: {
    backgroundColor: { control: 'color' },
    borderColor: { control: 'color' },
    color: { control: 'color' },
    size: {
      control: 'radio',
      options: ['small', 'medium', 'large'],
    },
    text: { control: 'text' },
  },

  // title: 'Button',
  // component: Button,
  // parameters: {
  //   layout: 'centered',
  // },
  // tags: ['autodocs'],
  // argTypes: {
  //   backgroundColor: { control: 'color' },

  //   borderColor: { control: 'color' },
  //   color: { control: 'color' },
  //   size: {
  //     control: 'radio',
  //     options: ['small', 'medium', 'large'],
  //   },
  //   text: {
  //     control: 'text',
  //   },
  // },
  // args: {
  //   onClick: fn(),
  //   type: 'button',
  // },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const LargePrimary: Story = {
  args: {
    text: 'Large Button',
    backgroundColor: 'bg-primary-normal ',
    borderColor: 'bg-primary-normal',
    color: '#FFFFFF',
    size: 'large',
  },
};
export const LargeSecondary: Story = {
  args: {
    text: 'Large Button',
    backgroundColor: 'bg-white ',
    borderColor: 'border-primary-normal',
    color: 'text-primary-normal',
    size: 'large',
  },
};
export const MediumPrimary: Story = {
  args: {
    text: 'Medium Button',
    backgroundColor: 'bg-primary-normal ',
    borderColor: 'bg-primary-normal',
    color: '#FFFFFF',
    size: 'medium',
  },
};
export const MediumSecondary: Story = {
  args: {
    text: 'Medium Button',
    backgroundColor: 'bg-white ',
    borderColor: 'border-primary-normal',
    color: 'text-primary-normal',
    size: 'medium',
  },
};

export const SmallPrimary: Story = {
  args: {
    text: 'Small Button',
    backgroundColor: 'bg-primary-normal ',
    borderColor: 'bg-primary-normal',
    color: '#FFFFFF',
    size: 'small',
  },
};

export const SmallSecondary: Story = {
  args: {
    text: 'Small Button',
    backgroundColor: 'bg-white ',
    borderColor: 'border-primary-normal',
    color: 'text-primary-normal',
    size: 'small',
  },
};
