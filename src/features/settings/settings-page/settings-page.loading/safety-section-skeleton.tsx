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

export function SafetySettingsOverviewSkeleton() {
  return (
    <div className="grid gap-9" aria-busy="true">
      <output className="sr-only">Loading safety information</output>
      {["reports", "account-actions", "restrictions"].map((section) => (
        <section key={section}>
          <SectionHeadingSkeleton />
          <div className="mt-6 border-border border-t">
            {["first", "second"].map((item) => (
              <div
                key={item}
                className="flex items-center gap-4 border-border border-b py-5 last:border-b-0"
              >
                <SkeletonText
                  className="min-w-0 flex-1"
                  lines={2}
                  size="sm"
                  widths={["w-40", "w-full max-w-sm"]}
                />
                <SkeletonButton className="hidden h-8 w-20 sm:block" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function SafetySettingsSectionSkeleton() {
  return (
    <div className="grid gap-9">
      <SafetySettingsOverviewSkeleton />
      <BlockedUsersSectionSkeleton />
    </div>
  );
}
