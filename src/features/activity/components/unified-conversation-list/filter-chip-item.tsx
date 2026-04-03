import { cn } from "@/shared/lib/utils";
import { memo } from "react";

interface FilterChipItemProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  badge: number | null;
}

export const FilterChipItem = memo(function FilterChipItem({
  label,
  isActive,
  onClick,
  badge,
}: FilterChipItemProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={isActive}
      onClick={onClick}
      className={cn(
        "shrink-0 inline-flex items-center gap-1.5 h-7.5 px-3 rounded-lg",
        "text-xs font-semibold whitespace-nowrap transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal",
        isActive
          ? "bg-forge-teal text-white shadow-md shadow-forge-teal/20"
          : "bg-muted/50 text-slate-muted hover:bg-muted hover:text-ink hover:shadow-sm",
      )}
    >
      {label}
      {badge != null && badge > 0 && (
        <span
          className={cn(
            "inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full text-nano font-bold leading-none transition-colors",
            isActive
              ? "bg-white/20 text-white"
              : "bg-forge-teal/10 text-forge-teal",
          )}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </button>
  );
});
