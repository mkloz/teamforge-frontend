import type { ComponentPropsWithoutRef } from "react";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

type LoadingBlockProps = ComponentPropsWithoutRef<"div">;

export function LoadingBlock({ className, ...props }: LoadingBlockProps) {
  return (
    <Skeleton
      shape="square"
      className={cn("rounded-xl", className)}
      {...props}
    />
  );
}
