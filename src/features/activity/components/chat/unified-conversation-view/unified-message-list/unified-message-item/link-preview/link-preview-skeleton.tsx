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
        "flex gap-3 rounded-xl p-2.5",
        isOwn ? "bg-black/10" : "border border-border/40 bg-muted/40",
      )}
    >
      <Skeleton shape="square" tone={tone} className="size-14 shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
        <Skeleton shape="pill" tone={tone} className="h-2.5 w-3/4" />
        <Skeleton shape="pill" tone={tone} className="h-2 w-full" />
        <Skeleton shape="pill" tone={tone} className="h-2 w-1/2" />
      </div>
    </div>
  );
}
