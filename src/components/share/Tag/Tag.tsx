import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';

const TagVariants = cva('rounded-lg px-2 py-1 font-label-2 font-semibold', {
  variants: {
    color: {
      primary: 'bg-cyan-50 text-primary-normal',
      green: 'bg-[#F6FFED] text-[#52C41A]',
      cyan: 'bg-cyan-50 text-cyan-700',
      blue: 'bg-neutral-99 text-[#1677FF]',
      gray: 'bg-fill-normal text-label-alternative',
      red: 'bg-fill-normal text-[#FF4D4F]',
      black: 'bg-label-normal text-static-white',
    },
  },
});
interface TagProps {
  label: string;
  color: 'primary' | 'green' | 'cyan' | 'blue' | 'gray' | 'red' | 'black';
  className?: string;
}
export default function Tag({ label, color, className }: TagProps) {
  return <span className={cn(TagVariants({ color }), className)}>{label}</span>;
}
