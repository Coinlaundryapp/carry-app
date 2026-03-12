import type { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, within, expect } from '@storybook/test';
import Button from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    backgroundColor: { control: 'color' },
    borderColor: { control: 'color' },
    color: { control: 'color' },
    state: {
      control: 'radio',
      options: ['primary', 'secondary', 'fillPrimary', 'fillSecondary', 'default', 'disabled'],
    },
    size: {
      control: 'radio',
      options: ['small', 'medium', 'large', 'full', 'hug'],
    },
  },
  args: {
    onClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// --- Large ---
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
    children: 'Large Fill Primary',
    state: 'fillPrimary',
    size: 'large',
  },
};

export const LargeFillSecondary: Story = {
  args: {
    children: 'Large Fill Secondary',
    state: 'fillSecondary',
    size: 'large',
  },
};

export const Default: Story = {
  args: {
    children: 'Large Default',
    state: 'default',
    size: 'large',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    // 버튼 클릭
    await userEvent.click(button);

    // onClick 핸들러 호출 확인
    await expect(args.onClick).toHaveBeenCalled();
  },
};

// --- Medium ---
export const MediumPrimary: Story = {
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
    children: 'Medium Fill Primary',
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

export const MediumDefault: Story = {
  args: {
    children: 'Medium Default',
    state: 'default',
    size: 'medium',
  },
};

// --- Small ---
export const SmallPrimary: Story = {
  args: {
    children: 'Small Primary',
    state: 'primary',
    size: 'small',
  },
};

export const SmallSecondary: Story = {
  args: {
    children: 'Small Secondary',
    state: 'secondary',
    size: 'small',
  },
};

export const SmallDefault: Story = {
  args: {
    children: 'Small Default',
    state: 'default',
    size: 'small',
  },
};

export const SmallFillPrimary: Story = {
  args: {
    children: 'Small Fill Primary',
    state: 'fillPrimary',
    size: 'small',
  },
};

export const SmallFillSecondary: Story = {
  args: {
    children: 'Small Fill Secondary',
    state: 'fillSecondary',
    size: 'small',
  },
};

// --- Full / Hug / Disabled (누락 variant) ---
export const FullWidth: Story = {
  args: {
    children: 'Full Width Button',
    state: 'fillPrimary',
    size: 'full',
  },
};

export const HugSize: Story = {
  args: {
    children: 'Hug',
    state: 'primary',
    size: 'hug',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    state: 'disabled',
    size: 'large',
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    // disabled 상태 확인
    await expect(button).toBeDisabled();
  },
};
