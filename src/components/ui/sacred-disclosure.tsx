import { useState, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion';
import { Button } from './button';
import { cn } from '@/lib/utils';

/** Explanatory inline details use the same sacred surface as DialogContent. */
export function SacredDisclosure({ title, children, defaultOpen = false, className, closeLabel = 'Close' }: { title: ReactNode; children: ReactNode; defaultOpen?: boolean; className?: string; closeLabel?: string }) {
  const [value, setValue] = useState(defaultOpen ? 'detail' : '');
  return <Accordion type="single" collapsible value={value} onValueChange={setValue} className={cn('sacred-disclosure min-w-0', className)}>
    <AccordionItem value="detail"><div className="relative"><AccordionTrigger className="px-4 pr-16">{title}</AccordionTrigger>{value && <Button type="button" variant="ghost" size="icon" aria-label={closeLabel} onClick={() => setValue('')} className="absolute right-10 top-2 sacred-inline-close"><X className="size-4" /></Button>}</div><AccordionContent><div className="sacred-disclosure-scroll px-4 pb-4">{children}</div></AccordionContent></AccordionItem>
  </Accordion>;
}