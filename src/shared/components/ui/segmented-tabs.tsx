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
  value: TValue;
}

export function SegmentedTabs<TValue extends string>({
  ariaLabel,
  className,
  fill = false,
  onChange,
  options,
  value,
}: SegmentedTabsProps<TValue>) {
  const layoutId = useId();
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-full border border-white/10 bg-forge-deep-surface p-0.5 shadow-sm",
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
              "relative isolate inline-flex h-9 min-w-0 items-center justify-center gap-1.5 overflow-hidden rounded-full px-3 font-bold text-xs leading-none outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-forge-teal/45 focus-visible:ring-offset-1 motion-reduce:transition-none",
              fill && "flex-1",
              active
                ? "text-white"
                : "text-white/65 hover:bg-white/8 hover:text-white",
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
                className="absolute inset-0 -z-10 rounded-full bg-forge-teal shadow-sm"
              />
            )}
            {Icon && (
              <Icon
                className={cn(
                  "size-3.5 shrink-0 transition-opacity duration-200 motion-reduce:transition-none",
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
