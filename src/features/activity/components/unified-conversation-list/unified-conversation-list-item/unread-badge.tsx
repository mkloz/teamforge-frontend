import { memo } from "react";
import { cn } from "@/shared/lib/utils";

interface UnreadBadgeProps {
  count: number;
  className?: string;
  isCompact?: boolean;
}

export const UnreadBadge = memo(function UnreadBadge({
  count,
  className,
  isCompact = false,
}: UnreadBadgeProps) {
  if (count <= 0) return null;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-forge-teal font-black text-micro text-white shadow-forge-teal/20 shadow-sm",
        isCompact ? "h-3.5 min-w-3.5 scale-90 px-1" : "h-4.5 min-w-4.5 px-1.5",
        className,
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
});
