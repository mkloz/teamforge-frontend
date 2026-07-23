import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { CountBadge } from "@/shared/components/ui/count-badge";
import { cn } from "@/shared/lib/utils";

interface FilterChipItemProps {
  ariaLabel?: string;
  className?: string;
  label: string;
  isActive: boolean;
  value: string;
  badge: number | null;
}

export function FilterChipItem({
  ariaLabel,
  className,
  label,
  isActive,
  value,
  badge,
}: FilterChipItemProps) {
  const shouldShowBadge = badge != null && badge > 0;

  return (
    <RadioGroupPrimitive.Item
      value={value}
      aria-label={ariaLabel ?? label}
      className={cn(
        "group/chip relative h-8 w-auto min-w-fit snap-start rounded-full px-2 md:h-7",
        "aspect-auto whitespace-nowrap",
        "inline-flex shrink-0 cursor-pointer select-none items-center justify-center gap-1 border font-bold text-xs leading-none outline-none",
        "transition-all duration-150 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/30 focus-visible:ring-offset-1",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "border-border/45 bg-card/35 text-slate-muted hover:-translate-y-1 hover:border-button-primary-border hover:bg-forge-teal-readable hover:text-white hover:shadow-button-primary active:translate-y-0 active:shadow-none",
        isActive &&
          "z-10 border-button-primary-border bg-forge-teal-readable text-white",
        className,
      )}
    >
      <span className="relative z-10">{label}</span>
      {shouldShowBadge ? (
        <CountBadge
          aria-hidden="true"
          count={badge}
          max={99}
          size="xs"
          tone="none"
          className={getFilterChipBadgeClassName(isActive)}
        />
      ) : null}
    </RadioGroupPrimitive.Item>
  );
}

function getFilterChipBadgeClassName(isActive: boolean) {
  return cn(
    "relative z-10 h-4 min-w-4 transition-colors",
    isActive
      ? "bg-white/20 text-white"
      : "bg-slate-muted/15 text-slate-muted group-hover/chip:bg-white/20 group-hover/chip:text-white",
  );
}
