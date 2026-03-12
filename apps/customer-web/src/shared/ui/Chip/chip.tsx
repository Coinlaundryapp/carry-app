type Props = {
  text: string;
  onClick: () => void;
};

function Chip({ text, onClick }: Props) {
  return (
    <button
      className="border-label-disable bg-static-white text-label-neutral font-caption-1 active:border-primary-normal active:bg-primary-normal active:text-static-white whitespace-pre rounded-xl border-[1px] px-[10px] py-[6px] font-medium"
      onClick={onClick}
    >
      {text}
    </button>
  );
}

export default Chip;
