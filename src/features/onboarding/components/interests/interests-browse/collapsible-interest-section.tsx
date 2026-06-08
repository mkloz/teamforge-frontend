import { motion } from "framer-motion";
import { ChevronDown, type LucideIcon } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import { cn } from "@/shared/lib/utils";

interface CollapsibleInterestSectionProps {
  children: ReactNode;
  count: number;
  icon: LucideIcon;
  title: string;
  className?: string;
  countClassName?: string;
  dotClassName?: string;
  iconClassName?: string;
  titleClassName?: string;
  trailing?: ReactNode;
}

export function CollapsibleInterestSection({
  children,
  count,
  icon: Icon,
  title,
  className,
  countClassName,
  dotClassName,
  iconClassName,
  titleClassName,
  trailing,
}: CollapsibleInterestSectionProps) {
  const [open, setOpen] = useState(true);

  return (
    <Collapsible open={open} onOpenChange={setOpen} asChild>
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "overflow-hidden rounded-xl border border-slate-muted/10 bg-canvas p-0.5",
          className,
        )}
      >
        <CollapsibleTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className="group h-auto w-full min-w-0 justify-start gap-2 rounded-xl px-3 py-3 text-left sm:px-4"
            aria-label={`${open ? "Collapse" : "Expand"} ${title}`}
          >
            <Icon className={cn("size-3 shrink-0", iconClassName)} />
            <span
              className={cn(
                "min-w-0 truncate font-bold font-sans text-micro transition-colors",
                titleClassName,
              )}
            >
              {title}
            </span>
            <div className="ml-0 flex shrink-0 items-center gap-1.5 sm:ml-1">
              <span className={cn("size-1 rounded-full", dotClassName)} />
              <span
                className={cn("font-bold font-sans text-xs", countClassName)}
              >
                {count}
              </span>
            </div>

            <div className="ml-auto flex min-w-0 shrink-0 items-center gap-1.5">
              {trailing}
              <motion.span
                animate={{ rotate: open ? 0 : -90 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="text-slate-muted/50 transition-colors group-hover:text-slate-muted"
                aria-hidden="true"
              >
                <ChevronDown size={14} strokeWidth={2} />
              </motion.span>
            </div>
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent>{children}</CollapsibleContent>
      </motion.section>
    </Collapsible>
  );
}
