interface SelectCardProps {
  children: React.ReactNode;
  clickHandler: () => void;
}

const SelectCard = ({ children, clickHandler }: SelectCardProps) => {
  return (
    <div
      className="flex h-[200px] w-[160px] rounded-xl border bg-static-white p-[30px] shadow-emphasize"
      onClick={clickHandler}
    >
      {children}
    </div>
  );
};

export default SelectCard;
