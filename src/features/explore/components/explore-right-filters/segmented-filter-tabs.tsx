import { cn } from "@/shared/lib/utils";
import type { LucideIcon } from "lucide-react";

interface SegmentedFilterOption<TValue extends string> {
  icon: LucideIcon;
  id: TValue;
  label: string;
}

interface SegmentedFilterTabsProps<TValue extends string> {
  onChange: (value: TValue) => void;
  options: Array<SegmentedFilterOption<TValue>>;
  value: TValue;
}

export function SegmentedFilterTabs<TValue extends string>({
  onChange,
  options,
  value,
}: SegmentedFilterTabsProps<TValue>) {
  return (
    <div
      className="grid grid-cols-3 gap-1 rounded-xl border border-border/40 bg-muted/20 p-1"
      role="tablist"
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
            onClick={() => onChange(option.id)}
            className={cn(
              "inline-flex h-9 min-w-0 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-bold outline-none transition-[background-color,color,box-shadow,transform] duration-200 focus-visible:ring-2 focus-visible:ring-primary/30",
              active
                ? "bg-background text-foreground shadow-sm ring-1 ring-border/20"
                : "text-muted-foreground/70 hover:bg-muted/40 hover:text-foreground active:scale-[0.98]",
            )}
          >
            <Icon
              className={cn(
                "size-3.5 shrink-0",
                active ? "text-primary" : "opacity-70",
              )}
            />
            <span className="min-w-0 truncate tracking-tight">
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
