import React, { forwardRef, PropsWithChildren } from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/utils/cn";

type Props = {
  isActive: boolean;
  onClick: VoidFunction;
  text: string;
};

const ChipVariants = cva(
  `rounded-xl border-[1px] font-caption-1 px-[10px] py-[6px] whitespace-pre`,
  {
    variants: {
      variant: {
        active: "border-primary-normal bg-primary-normal text-static-white",
        inactive: "border-label-disable bg-static-white text-label-neutral",
      },
    },
    defaultVariants: {
      variant: "inactive",
    },
  }
);

const Chip = forwardRef<HTMLButtonElement, Props>(
  ({ isActive, text, onClick }, ref) => {
    return (
      <button
        className={cn(
          ChipVariants({ variant: isActive ? "active" : "inactive" })
        )}
        onClick={onClick}
        ref={ref}
      >
        {text || " "}
      </button>
    );
  }
);

export default Chip;

// ERROR: Component definition is missing display nameeslintreact/display-name
// eslint error 해결
Chip.displayName = "Chip";
