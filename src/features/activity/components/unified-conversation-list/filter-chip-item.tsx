import { memo } from "react";
import { CategoryFilterChip } from "@/shared/components/ui/category-filter-chip";

interface FilterChipItemProps {
  label: string;
  isActive: boolean;
  value: string;
  badge: number | null;
}

export const FilterChipItem = memo(function FilterChipItem({
  label,
  isActive,
  value,
  badge,
}: FilterChipItemProps) {
  return (
    <CategoryFilterChip
      as="radio"
      value={value}
      aria-label={label}
      label={label}
      selected={isActive}
      badge={badge}
      className="h-8 px-3 md:h-6 md:px-2.5"
    />
  );
});
