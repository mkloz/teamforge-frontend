import {
  SkeletonCard,
  SkeletonText,
} from "@/shared/components/loading/skeleton-patterns";
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
        <SkeletonCard key={item} className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <SkeletonText
                className="flex-1"
                lines={2}
                widths={["w-24", "w-40"]}
              />
              <Skeleton
                shape="pill"
                className="h-7 w-16"
                tone={index === 0 ? "amber" : "default"}
              />
            </div>
            <SkeletonText lines={3} widths={["w-full", "w-11/12", "w-2/3"]} />
          </div>
        </SkeletonCard>
      ))}
    </div>
  );
}
