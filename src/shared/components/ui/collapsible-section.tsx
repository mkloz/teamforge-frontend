import { ChevronDown } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import { cn } from "@/shared/lib/utils";

type CollapsibleSectionVariant = "plain" | "card" | "panel";

interface CollapsibleSectionProps
  extends Omit<ComponentProps<typeof Collapsible>, "children"> {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  summary: ReactNode;
  triggerClassName?: string;
  variant?: CollapsibleSectionVariant;
}

const rootVariants: Record<CollapsibleSectionVariant, string> = {
  plain: "",
  card: "overflow-hidden rounded-xl bg-card",
  panel: "overflow-hidden rounded-2xl bg-card",
};

const triggerVariants: Record<CollapsibleSectionVariant, string> = {
  plain: "w-fit py-1 text-foreground text-xs",
  card: "w-full px-4 py-3 text-ink text-sm",
  panel: "w-full px-5 py-5 text-ink text-sm sm:px-6",
};

const contentVariants: Record<CollapsibleSectionVariant, string> = {
  plain: "pt-2",
  card: "px-4 pt-1 pb-4",
  panel: "px-5 pt-1 pb-6 sm:px-6",
};

export function CollapsibleSection({
  children,
  className,
  contentClassName,
  summary,
  triggerClassName,
  variant = "plain",
  ...props
}: CollapsibleSectionProps) {
  return (
    <Collapsible
      className={cn(
        "group/collapsible-section",
        rootVariants[variant],
        className,
      )}
      {...props}
    >
      <CollapsibleTrigger
        className={cn(
          "group/collapsible-trigger flex cursor-pointer items-center justify-between gap-3 rounded-lg text-left font-semibold outline-none transition-colors hover:text-foreground focus-visible:ring-1 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
          triggerVariants[variant],
          triggerClassName,
        )}
      >
        <div className="min-w-0 flex-1">{summary}</div>
        <ChevronDown
          className="size-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible-trigger:rotate-180 motion-reduce:transition-none"
          aria-hidden="true"
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className={cn(contentVariants[variant], contentClassName)}>
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
