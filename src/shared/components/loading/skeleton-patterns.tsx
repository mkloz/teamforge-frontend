import type React from "react";

import { Skeleton, type SkeletonProps } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

interface SkeletonTextProps extends React.ComponentProps<"div"> {
  lineClassName?: string;
  lines?: number;
  size?: "lg" | "md" | "sm";
  widths?: string[];
}

type SkeletonPrimitiveProps = Omit<SkeletonProps, "shape">;

const DEFAULT_TEXT_WIDTHS = ["w-full", "w-11/12", "w-3/4"];

function buildSkeletonKeys(prefix: string, count: number) {
  return Array.from({ length: count }, (_, index) => `${prefix}-${index + 1}`);
}

function getSkeletonTextHeight(size: SkeletonTextProps["size"]) {
  switch (size) {
    case "lg":
      return "h-4";
    case "sm":
      return "h-2.5";
    default:
      return "h-3";
  }
}

export function SkeletonText({
  className,
  lineClassName,
  lines = 3,
  size = "md",
  widths = DEFAULT_TEXT_WIDTHS,
  ...props
}: SkeletonTextProps) {
  const lineKeys = buildSkeletonKeys("skeleton-line", lines);

  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      {lineKeys.map((key, index) => (
        <Skeleton
          key={key}
          shape="pill"
          className={cn(
            getSkeletonTextHeight(size),
            widths[index % widths.length],
            lineClassName,
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({
  className,
  ...props
}: SkeletonPrimitiveProps) {
  return (
    <Skeleton
      shape="circle"
      className={cn("size-10 shrink-0", className)}
      {...props}
    />
  );
}

export function SkeletonButton({
  className,
  ...props
}: SkeletonPrimitiveProps) {
  return (
    <Skeleton shape="pill" className={cn("h-10 w-28", className)} {...props} />
  );
}
