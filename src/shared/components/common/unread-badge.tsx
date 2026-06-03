import { type HTMLAttributes, memo } from "react";
import { CountBadge } from "@/shared/components/ui/count-badge";
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
    <CountBadge
      count={count}
      max={99}
      size={isCompact ? "xs" : "sm"}
      tone="teal"
      className={cn(isCompact && "scale-90", className)}
      {...props}
    />
  );
});
