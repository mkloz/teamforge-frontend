import { cn } from "@/shared/lib/utils";
import { memo } from "react";

interface UnreadBadgeProps {
  count: number;
  className?: string;
}

export const UnreadBadge = memo(function UnreadBadge({
  count,
  className,
}: UnreadBadgeProps) {
  if (count <= 0) return null;

  return (
    <span
      className={cn(
        "shrink-0 inline-flex items-center justify-center min-w-4.5 h-4.5 px-1.5 rounded-full bg-forge-teal text-micro font-black text-white shadow-sm shadow-forge-teal/20 ",
        className,
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
});
