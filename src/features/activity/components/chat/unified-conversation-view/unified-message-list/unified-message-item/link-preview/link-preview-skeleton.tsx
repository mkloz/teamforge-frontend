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
        "flex gap-3 p-2.5 rounded-xl",
        isOwn ? "bg-black/10" : "bg-muted/40 border border-border/40",
      )}
    >
      <div className={cn("w-14 h-14 rounded-lg shrink-0", pulse)} />
      <div className="flex flex-col gap-1.5 flex-1 justify-center min-w-0">
        <div className={cn("h-2.5 rounded-full w-3/4", pulse)} />
        <div className={cn("h-2 rounded-full w-full", pulse)} />
        <div className={cn("h-2 rounded-full w-1/2", pulse)} />
      </div>
    </div>
  );
}
