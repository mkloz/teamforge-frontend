import type { LucideIcon } from "lucide-react";

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
  const activeIndex = options.findIndex((option) => option.id === value);
  const indicatorClassName = getIndicatorClassName(options.length, activeIndex);
  const hasAnimatedIndicator = indicatorClassName !== null;

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "relative inline-grid max-w-full rounded-full border border-white/10 bg-forge-deep-surface p-0.5 shadow-sm",
        getGridClassName(options.length),
        fill && "w-full",
        className,
      )}
    >
      {hasAnimatedIndicator && (
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-y-0.5 rounded-full bg-forge-teal shadow-sm transition-[left] duration-200 ease-out motion-reduce:transition-none",
            indicatorClassName,
          )}
        />
      )}
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
              "relative z-10 inline-flex h-9 min-w-0 items-center justify-center gap-1.5 rounded-full px-3 font-bold text-xs leading-none outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-forge-teal/45 focus-visible:ring-offset-1 motion-reduce:transition-none",
              fill && "flex-1",
              active
                ? cn(
                    "text-white",
                    !hasAnimatedIndicator && "bg-forge-teal shadow-sm",
                  )
                : "text-white/65 hover:bg-white/8 hover:text-white",
            )}
          >
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

function getGridClassName(optionCount: number) {
  switch (optionCount) {
    case 2:
      return "grid-cols-2";
    case 3:
      return "grid-cols-3";
    case 4:
      return "grid-cols-4";
    default:
      return "auto-cols-fr grid-flow-col";
  }
}

function getIndicatorClassName(optionCount: number, activeIndex: number) {
  if (activeIndex < 0) {
    return null;
  }

  if (optionCount === 2) {
    return activeIndex === 1 ? "left-1/2 w-1/2" : "left-0 w-1/2";
  }

  if (optionCount === 3) {
    if (activeIndex === 1) {
      return "left-1/3 w-1/3";
    }

    if (activeIndex === 2) {
      return "left-2/3 w-1/3";
    }

    return "left-0 w-1/3";
  }

  if (optionCount === 4) {
    if (activeIndex === 1) {
      return "left-1/4 w-1/4";
    }

    if (activeIndex === 2) {
      return "left-1/2 w-1/4";
    }

    if (activeIndex === 3) {
      return "left-3/4 w-1/4";
    }

    return "left-0 w-1/4";
  }

  return null;
}
