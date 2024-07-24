import { cn } from "@/utils/cn";

interface CheckIconProps {
  className?: string;
}
export default function CheckIcon({ className }: CheckIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 18 16"
      fill="none"
      className={cn("w-4 h-4 text-status-positive", className)}
    >
      <circle cx="9" cy="8" r="7" fill="currentColor" />
      <path d="M8.3999 11L11.9999 6" stroke="white" strokeLinecap="round" />
      <path d="M6 8.5L8.4 11" stroke="white" strokeLinecap="round" />
    </svg>
  );
}
