import type { Transition } from "framer-motion";
import { domAnimation, LazyMotion, m, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { useId } from "react";

import { cn } from "@/shared/lib/utils";

type SegmentedTabsSize = "lg" | "md" | "sm";

const ACTIVE_TAB_TRANSITION: Transition = {
  type: "spring",
  stiffness: 520,
  damping: 42,
  mass: 0.7,
};

const SEGMENTED_TAB_SIZE_CLASS_NAMES: Record<
  SegmentedTabsSize,
  { button: string; gap: string; icon: string }
> = {
  lg: {
    button: "h-11 gap-2 px-3.5 text-sm",
    gap: "gap-1",
    icon: "size-4",
  },
  md: {
    button: "h-9 gap-1.5 px-3 text-xs",
    gap: "gap-1",
    icon: "size-3.5",
  },
  sm: {
    button: "h-7 gap-1 px-2.5 text-micro",
    gap: "gap-0.5",
    icon: "size-3",
  },
};

export interface SegmentedTabOption<TValue extends string> {
  icon?: LucideIcon;
  id: TValue;
  label: string;
  shortLabel?: string;
}

interface SegmentedTabsProps<TValue extends string> {
  ariaLabel: string;
  className?: string;
  disabled?: boolean;
  fill?: boolean;
  onChange: (value: TValue) => void;
  options: ReadonlyArray<SegmentedTabOption<TValue>>;
  size?: SegmentedTabsSize;
  value: TValue;
}

function getActiveTabLayoutId({
  layoutId,
  prefersReducedMotion,
}: {
  layoutId: string;
  prefersReducedMotion: boolean | null;
}) {
  return prefersReducedMotion ? undefined : `${layoutId}-active-tab`;
}

function getSegmentedTabsClassName({
  className,
  fill,
  size,
}: {
  className?: string;
  fill: boolean;
  size: SegmentedTabsSize;
}) {
  return cn(
    "inline-flex max-w-full items-center rounded-full border border-border bg-input p-0.5 shadow-sm",
    SEGMENTED_TAB_SIZE_CLASS_NAMES[size].gap,
    fill && "flex w-full",
    className,
  );
}

function getSegmentedTabButtonClassName({
  active,
  disabled,
  fill,
  size,
}: {
  active: boolean;
  disabled: boolean;
  fill: boolean;
  size: SegmentedTabsSize;
}) {
  return cn(
    "relative isolate inline-flex min-w-0 items-center justify-center overflow-hidden rounded-full font-bold leading-none outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-1 focus-visible:ring-offset-background motion-reduce:transition-none",
    SEGMENTED_TAB_SIZE_CLASS_NAMES[size].button,
    fill && "flex-1",
    disabled && "cursor-not-allowed opacity-60",
    active
      ? "text-primary-foreground"
      : "text-slate-muted hover:bg-muted hover:text-ink",
  );
}

function getSegmentedTabIconClassName({
  active,
  size,
}: {
  active: boolean;
  size: SegmentedTabsSize;
}) {
  return cn(
    "shrink-0 transition-opacity duration-200 motion-reduce:transition-none",
    SEGMENTED_TAB_SIZE_CLASS_NAMES[size].icon,
    active ? "opacity-100" : "opacity-70",
  );
}

function getSegmentedTabLabelClassName(hasShortLabel: boolean) {
  return cn("min-w-0 truncate", hasShortLabel && "hidden sm:inline");
}

export function SegmentedTabs<TValue extends string>({
  ariaLabel,
  className,
  disabled = false,
  fill = false,
  onChange,
  options,
  size = "md",
  value,
}: SegmentedTabsProps<TValue>) {
  const layoutId = useId();
  const prefersReducedMotion = useReducedMotion();

  return (
    <LazyMotion features={domAnimation}>
      <fieldset
        className={getSegmentedTabsClassName({
          className,
          fill,
          size,
        })}
      >
        <legend className="sr-only">{ariaLabel}</legend>
        {options.map((option) => {
          const active = value === option.id;
          const Icon = option.icon;

          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={active}
              disabled={disabled}
              onClick={() => {
                onChange(option.id);
              }}
              className={getSegmentedTabButtonClassName({
                active,
                disabled,
                fill,
                size,
              })}
            >
              {active && (
                <m.span
                  layoutId={getActiveTabLayoutId({
                    layoutId,
                    prefersReducedMotion,
                  })}
                  transition={ACTIVE_TAB_TRANSITION}
                  className="absolute inset-0 -z-10 rounded-full bg-primary shadow-sm"
                />
              )}
              {Icon && (
                <Icon
                  className={getSegmentedTabIconClassName({ active, size })}
                  strokeWidth={active ? 2 : 1.5}
                  aria-hidden="true"
                />
              )}
              <span
                className={getSegmentedTabLabelClassName(
                  Boolean(option.shortLabel),
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
      </fieldset>
    </LazyMotion>
  );
}
