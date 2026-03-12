'use client';

import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDownIcon } from '@radix-ui/react-icons';

type TProps = {
  title: string;
  value: string;
  additionalContent?: React.ReactNode;
  children: React.ReactNode;
};

function CollapsiblePanel({ value, title, children, additionalContent }: TProps) {
  return (
    <AccordionPrimitive.Root type="single" collapsible className="h-[26px]">
      <AccordionPrimitive.Item value={value}>
        <AccordionPrimitive.Header className="flex">
          <AccordionPrimitive.Trigger className="flex flex-1 items-center justify-between py-4 font-medium transition-all [&[data-state=open]>svg]:rotate-180">
            <div className="flex w-full items-center justify-between">
              <span>{title}</span>
              {additionalContent && additionalContent}
            </div>
            <ChevronDownIcon className="text-label-alternative h-4 w-4 shrink-0 transition-transform duration-200" />
          </AccordionPrimitive.Trigger>
        </AccordionPrimitive.Header>
        <AccordionPrimitive.Content className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm">
          <div className="pb-4 pt-0">{children}</div>
        </AccordionPrimitive.Content>
      </AccordionPrimitive.Item>
    </AccordionPrimitive.Root>
  );
}

export default CollapsiblePanel;
