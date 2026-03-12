import React from 'react';

type Props = {
  title: string;
  subTitle: string;
  containerClassName?: string;
  titleClassName?: string;
  subTitleClassName?: string;
};

function FunnelHeader({
  title,
  subTitle,
  containerClassName,
  titleClassName = 'font_heading_1',
  subTitleClassName,
}: Props) {
  return (
    <div className={containerClassName}>
      <p className={`${titleClassName}`}>{title}</p>
      <p className={` ${subTitleClassName}`}>{subTitle}</p>
    </div>
  );
}

export default FunnelHeader;
