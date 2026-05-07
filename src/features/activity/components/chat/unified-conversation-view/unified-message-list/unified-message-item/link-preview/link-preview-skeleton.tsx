import { cn } from "@/shared/lib/utils";

interface LinkPreviewSkeletonProps {
  isOwn: boolean;
}

export function LinkPreviewSkeleton({ isOwn }: LinkPreviewSkeletonProps) {
  const pulse = isOwn
    ? "bg-white/15 animate-pulse"
    : "bg-muted/80 animate-pulse";

  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl p-2.5",
        isOwn ? "bg-black/10" : "border border-border/40 bg-muted/40",
      )}
    >
      <div className={cn("h-14 w-14 shrink-0 rounded-lg", pulse)} />
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
        <div className={cn("h-2.5 w-3/4 rounded-full", pulse)} />
        <div className={cn("h-2 w-full rounded-full", pulse)} />
        <div className={cn("h-2 w-1/2 rounded-full", pulse)} />
      </div>
    </div>
  );
}
