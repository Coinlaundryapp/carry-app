import React from 'react';

type TProps = {
  type?: 'button' | 'submit' | 'reset';
  text: string;
  borderStyle?: string;
  backgroundColor?: string;
  color?: string;
  borderColor?: string;
  size?: 'small' | 'medium' | 'large';
  onClick: () => void;
};

function Button({
  text,
  onClick,
  type = 'button',
  backgroundColor = 'bg-primary-normal',
  borderStyle = 'border-solid',
  borderColor = 'border-primary-normal',
  color = 'text-white',
  size = 'medium',
  ...rest
}: TProps) {
  const sizeClass = {
    small: 'w-[140px] py-1 px-2',
    medium: 'w-[310px] py-2 px-4',
    large: 'w-[342px] py-3 px-6',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`border ${borderStyle} ${backgroundColor} ${borderColor} ${color} font_body_1_normal rounded-md h-[52px] ${sizeClass[size]}`}
      {...rest}
    >
      {text}
    </button>
  );
}

export default Button;
