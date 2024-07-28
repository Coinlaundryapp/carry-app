import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../ui/accordion';

type TProps = {
  title: string;
  value: string;
  children: React.ReactNode;
};
function CollapsiblePanel({ value, title, children }: TProps) {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value={value}>
        <AccordionTrigger>{title}</AccordionTrigger>
        <AccordionContent>{children}</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export default CollapsiblePanel;
