import React, { useId } from "react";

type Props = {
  checked: boolean;
  onClick: VoidFunction;
  label?: string;
};

const CheckBox = ({ checked, onClick, label }: Props) => {
  const id = useId();

  return (
    <div className="flex gap-[8px] items-center">
      <input
        onClick={onClick}
        id={id}
        type="checkbox"
        checked={checked}
        className={`appearance-none bg-no-repeat bg-center checked:bg-[url('/image/check.svg')] w-[18px] h-[18px] border-[1.5px] ${checked ? "border-primary-normal" : "border-label-assistive"} ${checked ? "bg-primary-normal" : "bg-static-white"} rounded-[3px] cursor-pointer`}
      />
      {label && (
        <label
          htmlFor={id}
          className="cursor-pointer font-body-2-normal text-label-normal"
        >
          {label}
        </label>
      )}
    </div>
  );
};

export default CheckBox;
