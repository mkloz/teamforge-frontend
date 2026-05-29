import { Crown } from "lucide-react";
import type { HTMLAttributes, Ref } from "react";
import { cn } from "@/shared/lib/utils";

interface AdminCrownBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  iconClassName?: string;
  ref?: Ref<HTMLSpanElement>;
}

export function AdminCrownBadge({
  className,
  iconClassName = "size-3",
  ref,
  ...props
}: AdminCrownBadgeProps) {
  return (
    <span
      ref={ref}
      className={cn(
        "flex size-5 items-center justify-center rounded-md border border-spark-amber/40 bg-canvas text-ink shadow-[inset_0_0_0_999px_color-mix(in_srgb,var(--color-spark-amber)_16%,transparent)] ring-2 ring-canvas",
        className,
      )}
      {...props}
    >
      <Crown
        className={cn("shrink-0 fill-current", iconClassName)}
        strokeWidth={2}
        aria-hidden="true"
      />
    </span>
  );
}
