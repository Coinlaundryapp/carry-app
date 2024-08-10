import React from 'react';

type TProps = {
  text: string;
  borderStyle?: string;
  backgroundColor?: string;
  color?: string;
  borderColor?: string;
  size?: 'small' | 'medium' | 'large';
  state: 'primary' | 'secondary' | 'fillPrimary' | 'fillSecondary' | 'default';
  onClick: () => void;
};

function Button({ text, onClick, state, size = 'medium', ...rest }: TProps) {
  const sizeClass = {
    small: 'w-[140px] py-1 px-2',
    medium: 'w-[310px] py-2 px-4',
    large: 'w-[342px] py-3 px-6',
    full: 'flex w-full items-center justify-center',
  };

  const stateClass = {
    primary: '  border-primary-normal text-primary-normal',
    secondary: '  border-neutral-80 text-neutral-80',
    fillPrimary: ' bg-primary-normal  text-white',
    fillSecondary: ' bg-neutral-80  text-white',
    default: 'border-black',
  };

  return (
    <button
      onClick={onClick}
      className={`font_body_1_normal h-[52px] rounded-md border ${sizeClass[size]} ${stateClass[state]}`}
      {...rest}
    >
      {text}
    </button>
  );
}

export default Button;
