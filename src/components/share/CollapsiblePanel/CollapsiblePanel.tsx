import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../ui/Accordion';

type TProps = {
  title: string;
  value: string;
  additionalContent?: React.ReactNode;
  children: React.ReactNode;
};
function CollapsiblePanel({ value, title, children, additionalContent }: TProps) {
  return (
    <Accordion type="single" collapsible className="h-[26px]">
      <AccordionItem value={value}>
        <AccordionTrigger>
          <div className="flex w-full items-center justify-between">
            <span>{title}</span>
            {additionalContent && additionalContent}
          </div>
        </AccordionTrigger>
        <AccordionContent>{children}</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export default CollapsiblePanel;
