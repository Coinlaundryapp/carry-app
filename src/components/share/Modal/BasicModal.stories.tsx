// BasicModal.stories.tsx
import React, { useState } from 'react';
import { Meta } from '@storybook/react';
import BasicModal, { TBasicModalProps } from './BasicModal';

const meta: Meta<typeof BasicModal> = {
  title: 'BasicModal',
  component: BasicModal,
  argTypes: {
    isOpen: { control: 'boolean' },
    title: { control: 'text' },
    content: { control: 'text' },
  },
};

export default meta;

export const Template = (args: TBasicModalProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(args.isOpen);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-500 text-white p-2 rounded"
      >
        Open Modal
      </button>
      <BasicModal
        {...args}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={() => {
          alert('Confirmed!');
          setIsOpen(false);
        }}
      />
    </>
  );
};

Template.args = {
  isOpen: false,
  title: 'Alert title',
  content: 'Body .........',
};
