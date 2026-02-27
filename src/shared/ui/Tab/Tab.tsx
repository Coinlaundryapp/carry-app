'use client';

import * as TabsPrimitive from '@radix-ui/react-tabs';

interface TabProps {
  defaultTab: string;
  data: {
    label: string;
    content: React.ReactNode;
    value: string;
  }[];
}

export default function Tab({ defaultTab, data }: TabProps) {
  return (
    <TabsPrimitive.Root defaultValue={defaultTab}>
      <TabsPrimitive.List className="flex h-12 items-center justify-between">
        {data.map((tab) => (
          <TabsPrimitive.Trigger
            key={tab.value}
            value={tab.value}
            className="inline-flex w-full items-center justify-center border-b border-fill-alternative py-3 font-semibold text-label-alternative transition-all font-body-1-normal data-[state=active]:border-b-2 data-[state=active]:border-primary-normal data-[state=active]:text-primary-normal"
          >
            {tab.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>

      {data.map((tab) => (
        <TabsPrimitive.Content
          key={tab.label}
          value={tab.value}
          className="mt-2 focus-visible:outline-none"
        >
          {tab.content}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  );
}
