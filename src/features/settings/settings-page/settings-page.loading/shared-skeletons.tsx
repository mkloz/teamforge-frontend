import {
  SkeletonButton,
  SkeletonText,
} from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

export function SectionHeadingSkeleton() {
  return (
    <div className="max-w-2xl">
      <Skeleton className="h-5 w-44" tone="teal" />
      <SkeletonText
        className="mt-2 max-w-xl"
        lines={2}
        size="sm"
        widths={["w-full", "w-3/4"]}
      />
    </div>
  );
}

export function SettingsDetailHeaderSkeleton() {
  return (
    <div className="mb-8 lg:mb-10">
      <div className="fixed inset-x-0 top-0 z-50 border-border border-b bg-canvas px-3 py-2 sm:px-4 lg:hidden">
        <SkeletonButton className="h-8 w-24" />
      </div>
      <div className="min-w-0">
        <Skeleton className="h-3 w-24" tone="teal" />
        <Skeleton className="mt-3 h-8 w-full max-w-112" />
        <SkeletonText
          className="mt-3 max-w-2xl"
          lines={2}
          size="sm"
          widths={["w-full", "w-3/4"]}
        />
      </div>
    </div>
  );
}

export function FormGroupHeadingSkeleton({
  titleWidth = "w-40",
}: {
  titleWidth?: string;
}) {
  return (
    <div>
      <Skeleton className={cn("h-5", titleWidth)} tone="teal" />
      <SkeletonText
        className="mt-2 max-w-xl"
        lines={2}
        size="sm"
        widths={["w-full", "w-4/5"]}
      />
    </div>
  );
}

export function SettingsInputSkeleton({
  className,
  contentClassName,
  fieldAlign = "center",
  inputClassName = "h-11",
}: {
  className?: string;
  contentClassName?: string;
  fieldAlign?: "center" | "start";
  inputClassName?: string;
}) {
  return (
    <div className={className}>
      <Skeleton className="h-3 w-20" />
      <div
        className={cn(
          "mt-2 flex w-full rounded-xl border border-border bg-background px-3 py-2",
          fieldAlign === "start" ? "items-start" : "items-center",
          inputClassName,
        )}
      >
        <Skeleton className={cn("h-3.5 w-full max-w-56", contentClassName)} />
      </div>
    </div>
  );
}

export function StatPillSkeleton() {
  return (
    <div>
      <Skeleton className="h-3 w-20" />
      <Skeleton className="mt-2 h-5 w-24" />
    </div>
  );
}

export function PreferenceRowSkeleton({
  tone = "default",
}: {
  tone?: "default" | "teal";
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-muted/30 p-3 sm:gap-4 sm:p-4">
      <SkeletonText
        className="min-w-0 flex-1"
        lines={2}
        size="sm"
        widths={["w-40", "w-full"]}
      />
      <Skeleton shape="pill" className="h-7 w-12 shrink-0" tone={tone} />
    </div>
  );
}
