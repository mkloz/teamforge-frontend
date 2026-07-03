import { SettingsSessionRowSkeleton } from "@/features/settings/components/settings-session-row-skeleton";
import {
  SectionHeadingSkeleton,
  StatPillSkeleton,
} from "@/features/settings/settings-page/settings-page.loading/shared-skeletons";
import {
  SkeletonButton,
  SkeletonText,
} from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function SecuritySectionSkeleton() {
  return (
    <div className="flex flex-col gap-10">
      <section>
        <SectionHeadingSkeleton />
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <StatPillSkeleton />
          <StatPillSkeleton />
          <StatPillSkeleton />
        </div>
        <div className="mt-6 flex flex-col gap-3 border-border border-t pt-5 md:flex-row md:items-center md:justify-between">
          <SkeletonText lines={2} widths={["w-48", "w-72"]} />
          <SkeletonButton className="h-10 w-full md:w-44" tone="teal" />
        </div>
      </section>

      <section>
        <Skeleton className="h-5 w-40" tone="teal" />
        <div className="mt-4 border-border border-t">
          {["current", "other"].map((item, index) => (
            <SettingsSessionRowSkeleton key={item} active={index === 0} />
          ))}
        </div>
      </section>
    </div>
  );
}
