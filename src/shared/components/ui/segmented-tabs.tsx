import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { useId } from "react";

import { cn } from "@/shared/lib/utils";

export interface SegmentedTabOption<TValue extends string> {
  icon?: LucideIcon;
  id: TValue;
  label: string;
  shortLabel?: string;
}

interface SegmentedTabsProps<TValue extends string> {
  ariaLabel: string;
  className?: string;
  fill?: boolean;
  onChange: (value: TValue) => void;
  options: ReadonlyArray<SegmentedTabOption<TValue>>;
  size?: "md" | "sm";
  value: TValue;
}

export function SegmentedTabs<TValue extends string>({
  ariaLabel,
  className,
  fill = false,
  onChange,
  options,
  size = "md",
  value,
}: SegmentedTabsProps<TValue>) {
  const layoutId = useId();
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex max-w-full items-center rounded-full border border-border bg-input p-0.5 shadow-sm",
        size === "sm" ? "gap-0.5" : "gap-1",
        fill && "flex w-full",
        className,
      )}
    >
      {options.map((option) => {
        const active = value === option.id;
        const Icon = option.icon;

        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => {
              onChange(option.id);
            }}
            className={cn(
              "relative isolate inline-flex min-w-0 items-center justify-center overflow-hidden rounded-full font-bold leading-none outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-forge-teal/45 focus-visible:ring-offset-1 focus-visible:ring-offset-background motion-reduce:transition-none",
              size === "sm"
                ? "h-7 gap-1 px-2.5 text-micro"
                : "h-9 gap-1.5 px-3 text-xs",
              fill && "flex-1",
              active
                ? "text-white"
                : "text-slate-muted hover:bg-muted hover:text-ink",
            )}
          >
            {active && (
              <motion.span
                layoutId={
                  prefersReducedMotion ? undefined : `${layoutId}-active-tab`
                }
                transition={{
                  type: "spring",
                  stiffness: 520,
                  damping: 42,
                  mass: 0.7,
                }}
                className="absolute inset-0 -z-10 rounded-full bg-forge-teal-readable shadow-sm"
              />
            )}
            {Icon && (
              <Icon
                className={cn(
                  "shrink-0 transition-opacity duration-200 motion-reduce:transition-none",
                  size === "sm" ? "size-3" : "size-3.5",
                  active ? "opacity-100" : "opacity-70",
                )}
                strokeWidth={active ? 2 : 1.5}
                aria-hidden="true"
              />
            )}
            <span
              className={cn(
                "min-w-0 truncate",
                option.shortLabel && "hidden sm:inline",
              )}
            >
              {option.label}
            </span>
            {option.shortLabel && (
              <span className="min-w-0 truncate sm:hidden">
                {option.shortLabel}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
