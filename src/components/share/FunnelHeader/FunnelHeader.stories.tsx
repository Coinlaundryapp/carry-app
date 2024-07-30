import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import FunnelHeader from './FunnelHeader';

const meta: Meta<typeof FunnelHeader> = {
  title: 'Components/FunnelHeader',
  component: FunnelHeader,
  argTypes: {
    title: { control: 'text' },
    subTitle: { control: 'text' },
    containerClassName: { control: 'text' },
    titleClassName: { control: 'text' },
    subTitleClassName: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: '현재 관악구에 살고 계시나요?',
    subTitle: '지역 위치의 확인이 필요합니다.',
    containerClassName: 'p-4 ',
    titleClassName: 'font_heading_1',
    subTitleClassName: 'font_body_1_normal text-cool-neutral-60',
  },
};
