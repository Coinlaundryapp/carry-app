'use client';

import { ArrowUpIcon } from '@assets/icons';

export default function ScrollUpButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-cool-neutral-95 absolute bottom-[104px] right-5 flex h-14 w-14 items-center justify-center rounded-full"
    >
      <ArrowUpIcon />
    </button>
  );
}
