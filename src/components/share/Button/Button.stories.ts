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
    text: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const LargePrimary: Story = {
  args: {
    text: 'Large Primary',
    state: 'primary',
    size: "large",
  },
};

export const LargeSecondary: Story = {
  args: {
    text: 'Large Secondary',
    state: 'secondary',
    size: 'large',
  },
};
export const LargeFillPrimary: Story = {
  args: {
    text: 'Large Primary',
    state: 'fillPrimary',
    size: 'large',
  },
};

export const LargeFillSecondary: Story = {
  args: {
    text: 'Large Secondary',
    state: 'fillSecondary',
    size: 'large',
  },
};

export const Default: Story = {
  args: {
    text: 'Large Secondary',
    state: 'default',
    size: 'large',
  },
};

export const MedumPrimary: Story = {
  args: {
    text: "Medium Primary",
    state: "primary",
    size: "medium"
  }
};

export const MediumSecondary: Story = {
  args: {
    text: "Medium Secondary",
    state: "secondary",
    size: "medium"
  }
};

export const MediumFillPrimary: Story = {
  args: {
    text: "MediumFillPrimary",
    state: "fillPrimary",
    size: "medium"
  }
};

export const MediumFillSecondary: Story = {
  args: {
    text: "Medium Fill Secondary",
    state: "fillSecondary",
    size: "medium"
  }
};

export const MediumDefaultSecondary: Story = {
  args: {
    text: "Medium Default Secondary",
    state: "default",
    size: "medium"
  }
};

export const SmallDefault: Story = {
  args: {
    text: "Small Default",
    state: "default",
    size: "small"
  }
};

export const SmallFillSecondary: Story = {
  args: {
    text: "SmallFSecondary",
    state: "fillSecondary",
    size: "small"
  }
};

export const SmallFillPrimary: Story = {
  args: {
    text: "FillPrimary",
    state: "fillPrimary",
    size: "small"
  }
};

export const SmallSecondary: Story = {
  args: {
    text: "Secondary",
    state: "secondary",
    size: "small"
  }
};

export const SmallPrimary: Story = {
  args: {
    text: "Primary",
    state: "primary",
    size: "small"
  }
};
