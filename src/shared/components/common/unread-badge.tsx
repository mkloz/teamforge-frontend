import { type HTMLAttributes, memo } from "react";
import { cn } from "@/shared/lib/utils";

interface UnreadBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  count: number;
  isCompact?: boolean;
}

export const UnreadBadge = memo(function UnreadBadge({
  count,
  className,
  isCompact = false,
  ...props
}: UnreadBadgeProps) {
  if (count <= 0) return null;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-forge-teal font-black text-micro text-white shadow-forge-teal/20 shadow-sm",
        isCompact ? "h-3.5 min-w-3.5 scale-90 px-1" : "h-4.5 min-w-4.5 px-1.5",
        className,
      )}
      {...props}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
});
