import TopNavigation from "@/components/share/top-navigation/top-navigation";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Components/TopNavigation",
  component: TopNavigation,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {},
  args: {
    leftClick: () => {},
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div className="w-96 mx-auto border h-[200px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TopNavigation>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Back: Story = {
  args: {
    type: "back",
    title: "Title",
  },
};

export const Close: Story = {
  args: {
    type: "close",
    title: "Title",
  },
};
export const WithoutTitle: Story = {
  args: {
    type: "back",
    leftClick: () => {},
  },
};
export const BackWithoutTitle: Story = {
  args: {
    type: "back",
  },
};

export const BackWithSearch: Story = {
  args: {
    type: "back",
    title: "Title",
    rightClick: () => {},
  },
};
