import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/shared/lib/utils";

type LoadingBlockProps = ComponentPropsWithoutRef<"div">;

export function LoadingBlock({ className, ...props }: LoadingBlockProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "boneyard-loading-block rounded-xl forced-colors:bg-slate-muted/40",
        className,
      )}
      {...props}
    />
  );
}
