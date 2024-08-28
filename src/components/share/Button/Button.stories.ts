import type { Meta, StoryObj } from '@storybook/react';
import Button from './Button';

const meta: Meta<typeof Button> = {
  title: 'components/Button',
  component: Button,
  argTypes: {
    backgroundColor: { control: 'color' },
    borderColor: { control: 'color' },
    color: { control: 'color' },
    state: {
      control: 'radio',
      options: ['primary', 'secondary', 'fillPrimary', 'fillSecondary', 'default'],
    },
    size: {
      control: 'radio',
      options: ['small', 'medium', 'large'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const LargePrimary: Story = {
  args: {
    children: 'Large Primary',
    state: 'primary',
    size: 'large',
  },
};

export const LargeSecondary: Story = {
  args: {
    children: 'Large Secondary',
    state: 'secondary',
    size: 'large',
  },
};
export const LargeFillPrimary: Story = {
  args: {
    children: 'Large Primary',
    state: 'fillPrimary',
    size: 'large',
  },
};

export const LargeFillSecondary: Story = {
  args: {
    children: 'Large Secondary',
    state: 'fillSecondary',
    size: 'large',
  },
};

export const Default: Story = {
  args: {
    children: 'Large Secondary',
    state: 'default',
    size: 'large',
  },
};

export const MedumPrimary: Story = {
  args: {
    children: 'Medium Primary',
    state: 'primary',
    size: 'medium',
  },
};

export const MediumSecondary: Story = {
  args: {
    children: 'Medium Secondary',
    state: 'secondary',
    size: 'medium',
  },
};

export const MediumFillPrimary: Story = {
  args: {
    children: 'MediumFillPrimary',
    state: 'fillPrimary',
    size: 'medium',
  },
};

export const MediumFillSecondary: Story = {
  args: {
    children: 'Medium Fill Secondary',
    state: 'fillSecondary',
    size: 'medium',
  },
};

export const MediumDefaultSecondary: Story = {
  args: {
    children: 'Medium Default Secondary',
    state: 'default',
    size: 'medium',
  },
};

export const SmallDefault: Story = {
  args: {
    children: 'Small Default',
    state: 'default',
    size: 'small',
  },
};

export const SmallFillSecondary: Story = {
  args: {
    children: 'SmallFSecondary',
    state: 'fillSecondary',
    size: 'small',
  },
};

export const SmallFillPrimary: Story = {
  args: {
    children: 'FillPrimary',
    state: 'fillPrimary',
    size: 'small',
  },
};

export const SmallSecondary: Story = {
  args: {
    children: 'Secondary',
    state: 'secondary',
    size: 'small',
  },
};

export const SmallPrimary: Story = {
  args: {
    children: 'Primary',
    state: 'primary',
    size: 'small',
  },
};
