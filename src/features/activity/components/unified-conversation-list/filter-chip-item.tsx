import { memo } from "react";
import { CategoryFilterChip } from "@/shared/components/ui/category-filter-chip";
import { cn } from "@/shared/lib/utils";

interface FilterChipItemProps {
  ariaLabel?: string;
  className?: string;
  label: string;
  isActive: boolean;
  value: string;
  badge: number | null;
}

export const FilterChipItem = memo(function FilterChipItem({
  ariaLabel,
  className,
  label,
  isActive,
  value,
  badge,
}: FilterChipItemProps) {
  return (
    <CategoryFilterChip
      as="radio"
      value={value}
      aria-label={ariaLabel ?? label}
      label={label}
      selected={isActive}
      selectedVariant="soft"
      badge={badge}
      badgeClassName="border border-current/10 bg-current/10 text-current group-data-[state=checked]/chip:bg-current/10 group-data-[state=checked]/chip:text-current"
      className={cn(
        "h-8 snap-start px-3 shadow-none md:h-7",
        !isActive &&
          "border-border/70 bg-transparent text-slate-muted hover:border-forge-teal/35 hover:bg-forge-teal/6 hover:text-ink",
        className,
      )}
    />
  );
});
