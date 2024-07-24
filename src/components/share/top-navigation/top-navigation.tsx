import ArrowLeftIcon from "@/assets/icons/arrow-left";
import CloseIcon from "@/assets/icons/close";
import GeneralSearchIcon from "@/assets/icons/general-search";
import { cn } from "@/utils/cn";

interface TopNavigationProps {
  type: "back" | "close";
  title?: string;
  leftClick: () => void;
  rightClick?: () => void;
}
export default function TopNavigation({
  type,
  title,
  leftClick,
  rightClick,
}: TopNavigationProps) {
  return (
    <nav className="flex items-center justify-between w-full h-[52px] px-3">
      <button
        onClick={leftClick}
        className={cn("p-1.5", {
          "p-2": type === "close",
        })}
      >
        {type === "close" ? (
          <CloseIcon className="w-5 h-5" />
        ) : (
          <ArrowLeftIcon />
        )}
      </button>

      <p className="font-headline-1 text-label-strong">{title}</p>
      <div className="flex justify-center items-center">
        {rightClick && (
          <button onClick={rightClick} className="p-1.5">
            <GeneralSearchIcon />
          </button>
        )}
      </div>
    </nav>
  );
}
