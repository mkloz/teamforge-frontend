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
      badge={badge}
      className={cn("h-8 snap-start px-3 md:h-6 md:px-2.5", className)}
    />
  );
});
