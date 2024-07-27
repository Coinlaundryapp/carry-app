import { cn } from '@/lib/utils';

export default function SearchIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      {...props}
      className={cn('h-6 w-6', props.className)}
    >
      <path d="M20 20L14 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M15 9.5C15 10.9587 14.4205 12.3576 13.3891 13.3891C12.3576 14.4205 10.9587 15 9.5 15C8.04131 15 6.64236 14.4205 5.61091 13.3891C4.57946 12.3576 4 10.9587 4 9.5C4 8.04131 4.57946 6.64236 5.61091 5.61091C6.64236 4.57946 8.04131 4 9.5 4C10.9587 4 12.3576 4.57946 13.3891 5.61091C14.4205 6.64236 15 8.04131 15 9.5Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}
