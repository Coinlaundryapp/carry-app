import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/share/ui/tabs';

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
    <Tabs defaultValue={defaultTab}>
      <TabsList className="flex">
        {data.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} className="w-full">
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {data.map((tab) => (
        <TabsContent key={tab.label} value={tab.value}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
