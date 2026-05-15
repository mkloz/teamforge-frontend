import { Skeleton } from "@/shared/components/ui/skeleton";

export function TemplateSuggestionsSkeleton() {
  return <TemplateSuggestionsSkeletonContent />;
}

function TemplateSuggestionsSkeletonContent() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading template suggestions"
      className="grid grid-cols-1 gap-2.5 sm:grid-cols-2"
      role="status"
    >
      <span className="sr-only">Loading template suggestions</span>
      {["arts", "tech", "movement", "food"].map((item, index) => (
        <div
          key={item}
          className="flex h-24 min-w-0 overflow-hidden rounded-lg border border-border/40 bg-card text-left"
        >
          <Skeleton
            shape="square"
            className="h-full w-20 shrink-0 rounded-lg sm:w-24"
            tone={index === 0 ? "teal" : "default"}
          />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5 px-3 py-2.5">
            <div className="flex min-w-0 items-center gap-2">
              <Skeleton className="h-4 min-w-0 flex-1" />
              <Skeleton shape="circle" className="size-4 shrink-0" />
            </div>
            <Skeleton className="h-3 w-4/5" />
            <div className="mt-auto flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-10" />
                <Skeleton shape="pill" className="h-5 w-14" />
              </div>
              <Skeleton
                shape="pill"
                className="h-5 w-20"
                tone={index === 0 ? "teal" : "default"}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
