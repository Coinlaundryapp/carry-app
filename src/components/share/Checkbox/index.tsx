import React from 'react';
import CheckboxIcon from '../../../../public/assets/checkbox.svg';
import clsx from 'clsx';

interface CheckboxProps {
  className?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ className }) => {
  return <CheckboxIcon className={clsx('w-20 h-20', className)} />;
};

export default Checkbox;
