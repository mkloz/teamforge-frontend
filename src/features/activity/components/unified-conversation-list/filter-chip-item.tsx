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
      onClick={onClick}
      className={cn(
        "shrink-0 h-6 px-2.5 rounded-full text-[10px] font-bold transition-all duration-150 active:scale-95 flex items-center gap-1.5 cursor-pointer",
        isActive
          ? "bg-forge-teal text-white border-2 border-button-primary-border shadow-button-primary -translate-y-0.5"
          : "bg-canvas border-2 border-border/60 text-slate-muted hover:border-forge-teal/40 hover:text-ink",
      )}
    >
      <span>{label}</span>
      {badge != null && badge > 0 && (
        <span
          className={cn(
            "inline-flex items-center justify-center min-w-3.5 h-3.5 px-0.5 rounded-full text-[8px] font-black leading-none transition-colors",
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
