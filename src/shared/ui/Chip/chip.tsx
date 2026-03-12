type Props = {
  text: string;
  onClick: () => void;
};

function Chip({ text, onClick }: Props) {
  return (
    <button
      className="whitespace-pre rounded-xl border-[1px] border-label-disable bg-static-white px-[10px] py-[6px] font-medium text-label-neutral font-caption-1 active:border-primary-normal active:bg-primary-normal active:text-static-white"
      onClick={onClick}
    >
      {text}
    </button>
  );
}

export default Chip;
