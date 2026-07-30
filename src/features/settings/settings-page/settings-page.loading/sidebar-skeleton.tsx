import { SETTINGS_SECTION_GROUPS } from "@/features/settings/settings-page/settings-sections";
import { SkeletonButton } from "@/shared/components/loading/skeleton-patterns";
import {
  GroupedMenuAction,
  GroupedMenuItem,
  GroupedMenuList,
  GroupedMenuSection,
} from "@/shared/components/ui/grouped-menu";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

export function SettingsSidebarSkeleton({
  isMobileDetailOpen,
}: {
  isMobileDetailOpen: boolean;
}) {
  return (
    <aside className={cn("lg:block", isMobileDetailOpen && "hidden")}>
      <div className="lg:fixed lg:top-10 lg:max-h-[calc(100svh-5rem)] lg:w-60 lg:overflow-y-auto lg:pr-1">
        <div className="mb-5 border-border border-b pb-5 lg:border-b-0 lg:pb-0">
          <Skeleton className="h-8 w-32" tone="teal" />
        </div>
        <div className="flex flex-col gap-9">
          {SETTINGS_SECTION_GROUPS.map((group, groupIndex) => (
            <GroupedMenuSection
              key={group.id}
              headingId={`settings-skeleton-group-${group.id}`}
              label={<Skeleton className="h-3.5 w-24" />}
            >
              <GroupedMenuList>
                {group.sections.map((section, sectionIndex) => {
                  const isActive = groupIndex === 0 && sectionIndex === 0;

                  return (
                    <GroupedMenuItem key={section.id}>
                      <GroupedMenuAction selected={isActive}>
                        <Skeleton shape="circle" className="size-7 shrink-0" />
                        <Skeleton
                          className={cn(
                            "h-3.5",
                            section.id === "matching" ? "w-20" : "w-24",
                          )}
                        />
                        <Skeleton
                          shape="circle"
                          className="ml-auto size-4 shrink-0 lg:hidden"
                        />
                      </GroupedMenuAction>
                    </GroupedMenuItem>
                  );
                })}
              </GroupedMenuList>
            </GroupedMenuSection>
          ))}
        </div>
        <div className="mt-7">
          <SkeletonButton className="h-10 w-full" />
        </div>
      </div>
    </aside>
  );
}
