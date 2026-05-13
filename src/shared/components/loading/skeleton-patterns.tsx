import type React from "react";

import { Skeleton, type SkeletonProps } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

interface SkeletonTextProps extends React.ComponentProps<"div"> {
  lineClassName?: string;
  lines?: number;
  size?: "lg" | "md" | "sm";
  widths?: string[];
}

interface SkeletonListProps extends React.ComponentProps<"div"> {
  count?: number;
  itemClassName?: string;
  renderItem?: (index: number) => React.ReactNode;
}

type SkeletonPrimitiveProps = Omit<SkeletonProps, "shape">;

const DEFAULT_TEXT_WIDTHS = ["w-full", "w-11/12", "w-3/4"];
const TEXT_SIZE_CLASSES = {
  lg: "h-4",
  md: "h-3",
  sm: "h-2.5",
} as const;

function buildSkeletonKeys(prefix: string, count: number) {
  return Array.from({ length: count }, (_, index) => `${prefix}-${index + 1}`);
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
          className={cn(
            TEXT_SIZE_CLASSES[size],
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

export function SkeletonCard({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "rounded-xl border border-border bg-card/95 p-4 shadow-sm",
        className,
      )}
      {...props}
    >
      {children ?? (
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <SkeletonAvatar tone="teal" />
            <div className="min-w-0 flex-1">
              <SkeletonText lines={2} size="sm" widths={["w-2/5", "w-3/5"]} />
            </div>
          </div>
          <SkeletonText lines={3} widths={["w-full", "w-11/12", "w-4/5"]} />
        </div>
      )}
    </div>
  );
}

export function SkeletonList({
  className,
  count = 3,
  itemClassName,
  renderItem,
  ...props
}: SkeletonListProps) {
  const itemKeys = buildSkeletonKeys("skeleton-item", count);

  return (
    <div className={cn("flex flex-col gap-3", className)} {...props}>
      {itemKeys.map((key, index) => (
        <div key={key} className={itemClassName}>
          {renderItem?.(index) ?? (
            <SkeletonCard className="p-3">
              <div className="flex items-center gap-3">
                <SkeletonAvatar
                  className="size-9"
                  tone={index === 0 ? "teal" : "default"}
                />
                <div className="min-w-0 flex-1">
                  <SkeletonText
                    lines={2}
                    size="sm"
                    widths={
                      index % 2 === 0 ? ["w-1/2", "w-5/6"] : ["w-2/5", "w-3/4"]
                    }
                  />
                </div>
              </div>
            </SkeletonCard>
          )}
        </div>
      ))}
    </div>
  );
}
