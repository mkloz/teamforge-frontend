import { SectionHeadingSkeleton } from "@/features/settings/settings-page/settings-page.loading/shared-skeletons";
import { SkeletonText } from "@/shared/components/loading/skeleton-patterns";
import {
  GroupedMenuItem,
  GroupedMenuList,
} from "@/shared/components/ui/grouped-menu";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function BlockedUsersSectionSkeleton() {
  return (
    <section>
      <SectionHeadingSkeleton />
      <GroupedMenuList className="mt-5">
        {["first", "second"].map((item) => (
          <GroupedMenuItem key={item}>
            <div className="flex min-h-18 items-center gap-3 px-3 py-3 sm:px-5 sm:py-4">
              <Skeleton shape="circle" className="size-11" />
              <SkeletonText
                className="min-w-0 flex-1"
                lines={2}
                size="sm"
                widths={["w-36", "w-48"]}
              />
              <Skeleton className="hidden h-9 w-24 sm:block" />
            </div>
          </GroupedMenuItem>
        ))}
      </GroupedMenuList>
    </section>
  );
}

export function SafetySettingsOverviewSkeleton() {
  return (
    <section aria-busy="true">
      <output className="sr-only">Loading safety information</output>
      <SectionHeadingSkeleton />
      <GroupedMenuList className="mt-5">
        {["reports", "account-actions", "restrictions"].map((item) => (
          <GroupedMenuItem key={item}>
            <div className="flex min-h-16 items-center gap-3 px-3 py-3 sm:px-5">
              <Skeleton shape="circle" className="size-10 shrink-0" />
              <SkeletonText
                className="min-w-0 flex-1"
                lines={2}
                size="sm"
                widths={["w-40", "w-full max-w-sm"]}
              />
              <Skeleton shape="pill" className="h-5 w-14" />
            </div>
          </GroupedMenuItem>
        ))}
      </GroupedMenuList>
    </section>
  );
}

export function SafetySettingsSectionSkeleton() {
  return (
    <div className="grid gap-10">
      <SafetySettingsOverviewSkeleton />
      <BlockedUsersSectionSkeleton />
    </div>
  );
}
