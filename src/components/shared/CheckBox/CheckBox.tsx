import React, { useId } from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/utils/cn";

type Props = {
  checked: boolean;
  onClick: VoidFunction;
  label?: string;
};

const CheckBoxVariants = cva(
  `appearance-none w-[18px] h-[18px] border-[1.5px] rounded-[3px] cursor-pointer`,
  {
    variants: {
      variant: {
        active:
          "bg-no-repeat bg-center checked:bg-[url('/image/check.svg')] border-primary-normal bg-primary-normal",
        inactive: "border-label-assistive bg-static-white",
      },
    },
    defaultVariants: {
      variant: "inactive",
    },
  }
);

const CheckBox = ({ checked, onClick, label }: Props) => {
  const id = useId();

  return (
    <div className="flex gap-[8px] items-center">
      <input
        onClick={onClick}
        id={id}
        type="checkbox"
        checked={checked}
        className={cn(
          CheckBoxVariants({ variant: checked ? "active" : "inactive" })
        )}
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
