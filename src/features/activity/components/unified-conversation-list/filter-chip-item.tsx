import { cn } from "@/shared/lib/utils";
import { memo } from "react";
import { Button } from "@/shared/components/ui/button";

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
    <Button
      asChild
      variant={isActive ? "primary" : "subtle"}
      size="xs"
      className={cn(
        "shrink-0 h-8 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-200",
        isActive && "shadow-md shadow-forge-teal/20",
      )}
    >
      <button
        type="button"
        role="radio"
        aria-checked={isActive}
        onClick={onClick}
      >
        {label}
        {badge != null && badge > 0 && (
          <span
            className={cn(
              "ml-1.5 inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full text-none font-black leading-none transition-colors",
              isActive
                ? "bg-white/20 text-white"
                : "bg-forge-teal text-white shadow-sm shadow-forge-teal/30",
            )}
          >
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </button>
    </Button>
  );
});
