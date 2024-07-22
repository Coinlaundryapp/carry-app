import React, { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
  isActive: boolean;
  onClick: VoidFunction;
}>;

const Chip = ({ isActive, children, onClick }: Props) => {
  return (
    <button
      className={`rounded-xl border-[1px] ${isActive ? "border-primary-normal" : "border-label-disable"} ${isActive ? "bg-primary-normal" : "bg-static-white"} font-caption-1 ${isActive ? "text-static-white" : "text-label-neutral"} px-[10px] py-[6px]`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Chip;
