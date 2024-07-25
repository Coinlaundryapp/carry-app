import React, { createContext, PropsWithChildren, useContext } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  size?: "small" | "big";
};

type ContextType = Props;

const RadioContext = createContext<ContextType | null>(null);

const Button = ({ value }: Pick<Props, "value">) => {
  const context = useContext(RadioContext);
  const checked = context?.value === value;
  const size =
    context?.size === "small"
      ? "w-[16px] h-[16px] checked:border-[4.5px]"
      : "w-[20px] h-[20px] checked:border-[6px]";

  return (
    <input
      type="radio"
      checked={checked}
      onChange={(e) => context?.onChange(e.target.value)}
      className={`${size} rounded-full appearance-none border-[1.5px] bg-static-white checked:bg-cyan-50 border-label-assistive checked:border-primary-normal`}
    />
  );
};

const Group = ({
  children,
  onChange,
  value,
  size = "small",
}: PropsWithChildren<Props>) => {
  return (
    <RadioContext.Provider value={{ value, onChange, size }}>
      {children}
    </RadioContext.Provider>
  );
};

export const Radio = {
  Button,
  Group,
};
