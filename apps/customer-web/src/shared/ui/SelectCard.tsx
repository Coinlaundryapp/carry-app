interface SelectCardProps {
  children: React.ReactNode;
  clickHandler: () => void;
}

const SelectCard = ({ children, clickHandler }: SelectCardProps) => {
  return (
    <div
      className="bg-static-white shadow-normal flex h-[200px] w-[160px] rounded-xl border p-[30px]"
      onClick={clickHandler}
    >
      {children}
    </div>
  );
};

export default SelectCard;
