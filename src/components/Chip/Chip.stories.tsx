import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import Chip from "./Chip";

const meta = {
  title: "Components/Chip",
  component: Chip,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    isActive: { control: "boolean" },
  },
  args: { onClick: fn() },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {
  args: {
    isActive: true,
    children: "Chip",
  },
};

export const InActive: Story = {
  args: {
    isActive: false,
    children: "Chip",
  },
};
