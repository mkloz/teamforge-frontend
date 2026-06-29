import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

interface LinkPreviewSkeletonProps {
  isOwn: boolean;
}

export function LinkPreviewSkeleton({ isOwn }: LinkPreviewSkeletonProps) {
  const tone = isOwn ? "teal" : "default";

  return (
    <div
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border transition-colors duration-150",
        isOwn
          ? "border-primary/10 bg-white/25 dark:bg-black/25"
          : "border-border/50 bg-card",
      )}
    >
      <Skeleton
        shape="square"
        tone={tone}
        className="aspect-video w-full rounded-lg"
      />
      <div className="flex gap-2.5 px-2.5 py-2">
        <Skeleton
          shape="square"
          tone={tone}
          className="mt-0.5 size-5 shrink-0"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <Skeleton shape="pill" tone={tone} className="h-2.5 w-28" />
          <Skeleton shape="pill" tone={tone} className="h-3 w-full" />
          <Skeleton shape="pill" tone={tone} className="h-2.5 w-5/6" />
          <Skeleton shape="pill" tone={tone} className="h-2.5 w-2/3" />
        </div>
        <Skeleton
          shape="circle"
          tone={tone}
          className="mt-0.5 size-3 shrink-0"
        />
      </div>
    </div>
  );
}
