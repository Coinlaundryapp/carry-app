import React from 'react';

type TProps = {
  type: 'button' | 'submit' | 'reset';
  text: string;
  borderStyle: string;
  backgroundColor?: string;
  color: string;
  borderColor?: string;
  size?: 'small' | 'medium' | 'large';
  onClick: () => void;
};

const Button: React.FC<TProps> = ({
  text,
  onClick,
  type = 'button',
  backgroundColor = 'bg-white',
  borderStyle,
  borderColor,
  color,
  size = 'medium',
  ...rest
}) => {
  const sizeClass = {
    small: 'w-[140px]  py-1 px-2 ',
    medium: 'w-[310px]  py-2 px-4 ',
    large: 'w-[342px] py-3 px-6 ',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      style={{
        borderColor,
        color,
      }}
      className={`border font_body_1_normal rounded-md h-[52px] ${sizeClass[size]} ${backgroundColor} ${borderColor} ${color}`}
      // className={`font_body_1_normal rounded-md h-[52px]  ${sizeClass[size]} ${backgroundColor}`}
      {...rest}
    >
      {text}
    </button>
  );
};

export default Button;
