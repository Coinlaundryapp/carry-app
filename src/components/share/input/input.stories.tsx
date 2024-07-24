import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Input, InputProps } from "@/components/share/input/input";
import SearchIcon from "@/assets/icons/search";
import CheckIcon from "@/assets/icons/check";
import CancelIcon from "@/assets/icons/cancel";

const meta = {
  title: "components/Input",
  component: Input,
  tags: ["autodocs"],
  args: {
    type: "text",
    status: "default",
    placeholder: "Placeholder",
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div className="w-96 mx-auto">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

const render = (args: InputProps) => {
  const [value, setValue] = useState(args.value);
  args.value = value;
  args.onClear = fn(() => setValue(""));
  args.onChange = fn((e: React.ChangeEvent<HTMLInputElement>) =>
    setValue(e.target.value)
  );
  return <Input {...args} />;
};

export const Default: Story = {
  args: {
    value: "",
    status: "default",
  },
  render,
};

export const Success: Story = {
  args: {
    value: "lorem@ipsum.com",
    status: "success",
    statusMessage: "Success message",
    successIcon: <CheckIcon />,
  },
  render,
};

export const Error: Story = {
  args: {
    value: "lorem@ipsum.com",
    status: "error",
    statusMessage: "Error message",
    errorIcon: <CancelIcon className="text-status-destructive" />,
  },
  render,
};

export const Done: Story = {
  args: {
    value: "유효한 텍스트 입력 완료",
    status: "done",
  },
  render,
};
export const Search: Story = {
  args: {
    type: "text",
    status: "default",
    placeholder: "검색어를 입력하세요",
    leftIcon: <SearchIcon />,
  },
  render,
};
