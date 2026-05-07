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
      className="grid grid-cols-3 gap-0.5 rounded-lg border border-border/45 bg-muted/15 p-0.5"
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
              "inline-flex h-8 min-w-0 items-center justify-center gap-1 rounded-md px-1.5 text-[11px] font-bold transition-[background-color,color,box-shadow,transform] duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
              active
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground/70 hover:bg-muted/35 hover:text-foreground active:scale-[0.98]",
            )}
          >
            <Icon
              className={cn(
                "size-3 shrink-0",
                active ? "text-forge-teal" : "opacity-60",
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
