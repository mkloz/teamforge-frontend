import {
  Skeleton as BoneyardSkeleton,
  type SkeletonProps as BoneyardSkeletonProps,
} from "boneyard-js/react";

import { TEAMFORGE_BONEYARD_CONFIG } from "@/shared/components/loading/boneyard-theme";
import { LoadingBlock } from "@/shared/components/loading/loading-block";
import { cn } from "@/shared/lib/utils";

type GeneratedSkeletonProps = Omit<
  BoneyardSkeletonProps,
  | "animate"
  | "boneClass"
  | "color"
  | "darkColor"
  | "darkShimmerColor"
  | "shimmerColor"
  | "speed"
  | "stagger"
  | "transition"
>;

export function GeneratedSkeleton({
  className,
  fallback,
  ...props
}: GeneratedSkeletonProps) {
  const resolvedFallback =
    fallback === undefined ? (
      <LoadingBlock className="min-h-32 w-full" />
    ) : (
      fallback
    );

  return (
    <BoneyardSkeleton
      className={cn("min-w-0", className)}
      fallback={resolvedFallback}
      {...TEAMFORGE_BONEYARD_CONFIG}
      {...props}
    />
  );
}
