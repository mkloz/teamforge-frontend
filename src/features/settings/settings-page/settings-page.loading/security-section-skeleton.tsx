import { SettingsSessionRowSkeleton } from "@/features/settings/components/settings-session-row-skeleton";
import { SectionHeadingSkeleton } from "@/features/settings/settings-page/settings-page.loading/shared-skeletons";
import { SkeletonButton } from "@/shared/components/loading/skeleton-patterns";
import {
  GroupedMenuItem,
  GroupedMenuList,
} from "@/shared/components/ui/grouped-menu";
import { Skeleton } from "@/shared/components/ui/skeleton";

const SECURITY_MENU_SKELETON_ROWS = ["identity", "method", "action"] as const;

export function SecuritySectionSkeleton() {
  return (
    <div className="flex flex-col gap-10">
      <SecurityMenuSkeleton />

      <section>
        <SectionHeadingSkeleton />
        <GroupedMenuList className="mt-5">
          <SettingsSessionRowSkeleton active />
          <SettingsSessionRowSkeleton />
        </GroupedMenuList>
      </section>

      <SecurityMenuSkeleton />
    </div>
  );
}

function SecurityMenuSkeleton() {
  return (
    <section>
      <SectionHeadingSkeleton />
      <GroupedMenuList className="mt-5">
        {SECURITY_MENU_SKELETON_ROWS.map((row, index) => (
          <GroupedMenuItem key={row}>
            <div className="flex min-h-16 items-center gap-3 px-3 py-3 sm:px-5">
              <Skeleton
                shape="circle"
                className="size-10 shrink-0"
                tone={index === 0 ? "teal" : "default"}
              />
              <div className="min-w-0 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="mt-2 h-3 w-full max-w-64" />
              </div>
              {index > 0 ? (
                <SkeletonButton className="hidden h-8 w-24 sm:block" />
              ) : (
                <Skeleton shape="pill" className="h-5 w-16" tone="teal" />
              )}
            </div>
          </GroupedMenuItem>
        ))}
      </GroupedMenuList>
    </section>
  );
}
