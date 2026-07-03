import { SectionHeadingSkeleton } from "@/features/settings/settings-page/settings-page.loading/shared-skeletons";
import {
  SkeletonButton,
  SkeletonText,
} from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function BlockedUsersSectionSkeleton() {
  return (
    <section>
      <SectionHeadingSkeleton />
      <div className="mt-6 border-border border-t">
        {["first", "second"].map((item) => (
          <div
            key={item}
            className="flex items-center gap-4 border-border border-b py-5 last:border-b-0"
          >
            <Skeleton shape="circle" className="size-11" />
            <SkeletonText
              className="min-w-0 flex-1"
              lines={2}
              size="sm"
              widths={["w-36", "w-48"]}
            />
            <SkeletonButton className="hidden h-10 w-24 sm:block" />
          </div>
        ))}
      </div>
    </section>
  );
}
