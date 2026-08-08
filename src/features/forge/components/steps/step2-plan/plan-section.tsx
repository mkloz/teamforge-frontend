"use client";

import { AnimatePresence, m } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

interface PlanSectionProps {
  active: boolean;
  children: ReactNode;
  complete: boolean;
  index: number;
  onToggle: () => void;
  sectionId: string;
  summary: string;
  title: string;
}

export function PlanSection({
  active,
  children,
  complete,
  index,
  onToggle,
  sectionId,
  summary,
  title,
}: PlanSectionProps) {
  const contentId = `${sectionId}-content`;

  return (
    <section
      id={sectionId}
      className={cn(
        "border-border/35 border-b transition-colors",
        active && "bg-forge-teal/3",
      )}
    >
      <button
        type="button"
        aria-controls={contentId}
        aria-expanded={active}
        className="group grid min-h-20 w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 px-1 py-4 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground focus-visible:ring-inset sm:min-h-24 sm:gap-x-5 sm:px-4"
        onClick={onToggle}
      >
        <span
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full border font-bold text-xs transition-colors",
            active
              ? "border-forge-teal bg-forge-teal text-white"
              : complete
                ? "border-forge-teal/45 bg-forge-teal/10 text-foreground"
                : "border-border/55 text-muted-foreground",
          )}
        >
          {complete && !active ? (
            <Check className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
          ) : (
            String(index).padStart(2, "0")
          )}
        </span>

        <span className="grid min-w-0 gap-1 sm:grid-cols-[minmax(7rem,0.65fr)_minmax(0,1fr)] sm:items-baseline sm:gap-5">
          <span
            className={cn(
              "font-bold text-foreground text-lg tracking-tight transition-colors sm:text-xl",
              active && "text-ink",
            )}
          >
            {title}
          </span>
          <span
            className={cn(
              "truncate text-muted-foreground text-sm",
              active && "text-foreground/75",
            )}
          >
            {summary}
          </span>
        </span>

        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:text-foreground",
            active && "rotate-180 text-foreground",
          )}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence initial={false}>
        {active ? (
          <m.div
            id={contentId}
            key={contentId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden"
          >
            <div className="px-1 pb-6 sm:px-16 sm:pb-8">{children}</div>
          </m.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
