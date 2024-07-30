import { Meta, StoryObj } from '@storybook/react';
import CollapsiblePanel from './CollapsiblePanel';
import IconAvatar3 from '../../../../public/assets/icons/avatar-girl-icon.svg';

const additionalContent = (
  <div className="flex items-center pr-2">
    <div className="flex -space-x-3.5">
      <IconAvatar3 />
      <IconAvatar3 />
      <IconAvatar3 />
    </div>
    <span className="ml-2">
      총 <span className="text-primary-normal">3</span>명
    </span>
  </div>
);

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
    title: '함께하는 멤버',
    value: 'example-value',

    children: 'This is the content inside the collapsible panel.',
  },
};

export const Additional: Story = {
  args: {
    title: '함께하는 멤버',
    value: 'example-value',
    additionalContent: additionalContent,
    children: 'This is the content inside the collapsible panel.',
  },
};
