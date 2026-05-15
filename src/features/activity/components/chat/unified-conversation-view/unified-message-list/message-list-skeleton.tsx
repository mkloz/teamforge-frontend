import { SkeletonText } from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

const MESSAGE_LIST_SKELETON_ROWS = [
  "arrival",
  "system",
  "reply",
  "proposal",
  "follow-up",
] as const;

export function MessageListSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading messages"
      className="flex min-h-full flex-col gap-5 px-3 py-2"
      role="status"
    >
      <span className="sr-only">Loading messages</span>
      <div className="mx-auto">
        <Skeleton shape="pill" className="h-7 w-24" />
      </div>

      {MESSAGE_LIST_SKELETON_ROWS.map((row, index) => (
        <div
          key={row}
          className={cn(
            "flex gap-3",
            index === 1
              ? "justify-center"
              : index % 2 === 0
                ? "justify-end"
                : "",
          )}
        >
          {index === 1 ? (
            <Skeleton shape="pill" className="h-6 w-72 max-w-full" />
          ) : (
            <div
              className={cn(
                "max-w-lg rounded-xl border border-border bg-card p-3 shadow-sm",
                index % 2 === 0 && "bg-forge-teal/12",
                index === 3 && "w-96 max-w-full",
              )}
            >
              {index === 3 ? (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Skeleton shape="circle" className="size-9" tone="amber" />
                    <SkeletonText
                      className="min-w-0 flex-1"
                      lines={2}
                      widths={["w-28", "w-36"]}
                    />
                  </div>
                  <Skeleton shape="pill" className="h-8 w-20 shrink-0" />
                </div>
              ) : (
                <SkeletonText
                  lines={index === 0 ? 1 : 2}
                  widths={index === 0 ? ["w-72"] : ["w-80", "w-56"]}
                />
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
