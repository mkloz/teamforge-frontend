import {
  COMPACT_BENTO_SLOTS,
  CompactBentoGrid,
  CompactBentoItem,
} from "@/shared/components/ui/bento-grid";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function TemplateSuggestionsSkeleton() {
  return <TemplateSuggestionsSkeletonContent />;
}

function TemplateSuggestionsSkeletonContent() {
  return (
    <CompactBentoGrid aria-busy="true">
      <output className="sr-only">Loading template suggestions</output>
      {COMPACT_BENTO_SLOTS.map((slot, index) => (
        <CompactBentoItem key={slot} slot={slot}>
          <div className="relative size-full min-w-0 overflow-hidden rounded-2xl">
            <Skeleton
              shape="square"
              className="absolute inset-0 size-full"
              tone={index === 0 ? "teal" : "default"}
            />
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-3">
              <Skeleton className="h-4 w-3/5 rounded-md" />
              <div className="flex items-center gap-2">
                <Skeleton shape="pill" className="h-3 w-16" />
                <Skeleton shape="pill" className="h-3 w-12" />
              </div>
            </div>
          </div>
        </CompactBentoItem>
      ))}
    </CompactBentoGrid>
  );
}
