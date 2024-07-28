import { Meta, StoryObj } from '@storybook/react';
import CollapsiblePanel from './CollapsiblePanel';

const meta: Meta<typeof CollapsiblePanel> = {
  title: 'Components/CollapsiblePanel',
  component: CollapsiblePanel,
  argTypes: {
    title: { control: 'text' },
    value: { control: 'text' },
    children: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Example Title',
    value: 'example-value',
    children: 'This is the content inside the collapsible panel.',
  },
};
