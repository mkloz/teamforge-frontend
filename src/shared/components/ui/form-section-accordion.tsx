import type { LucideIcon } from "lucide-react";
import type React from "react";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import { cn } from "@/shared/lib/utils";

interface FormSectionAccordionItemProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  icon: LucideIcon;
  summary?: React.ReactNode;
  title: string;
  value: string;
}

export function FormSectionAccordionItem({
  children,
  className,
  contentClassName,
  icon: Icon,
  summary,
  title,
  value,
}: FormSectionAccordionItemProps) {
  return (
    <AccordionItem
      value={value}
      className={cn(
        "overflow-hidden rounded-xl bg-card/70 shadow-soft-sm transition-[background-color,box-shadow] data-[state=open]:bg-primary-soft data-[state=open]:shadow-soft-md",
        className,
      )}
    >
      <AccordionTrigger className="group items-center px-4 py-3.5 hover:no-underline focus-visible:border-transparent focus-visible:ring-foreground focus-visible:ring-inset">
        <span className="flex min-w-0 items-center gap-3">
          <Icon
            className="size-4 shrink-0"
            strokeWidth={1.8}
            aria-hidden="true"
          />
          <span className="min-w-0">
            <span className="block font-semibold text-foreground text-sm leading-snug">
              {title}
            </span>
            {summary ? (
              <span className="mt-0.5 block truncate font-normal text-muted-foreground text-xs leading-snug">
                {summary}
              </span>
            ) : null}
          </span>
        </span>
      </AccordionTrigger>
      <AccordionContent
        className={cn("border-border/45 border-t px-4 py-4", contentClassName)}
      >
        {children}
      </AccordionContent>
    </AccordionItem>
  );
}
