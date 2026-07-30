import {
  SkeletonAvatar,
  SkeletonButton,
  SkeletonText,
} from "@/shared/components/loading/skeleton-patterns";
import {
  GroupedMenuItem,
  GroupedMenuList,
} from "@/shared/components/ui/grouped-menu";

export function SettingsBlockedUsersSkeleton() {
  return (
    <GroupedMenuList aria-busy="true">
      <output className="sr-only">Loading blocked users</output>
      {["first", "second"].map((item) => (
        <GroupedMenuItem key={item}>
          <div className="flex min-h-18 items-center gap-3 px-3 py-3 sm:px-5 sm:py-4">
            <SkeletonAvatar className="size-11" />
            <SkeletonText
              className="min-w-0 flex-1"
              lines={2}
              size="sm"
              widths={["w-36", "w-48"]}
            />
            <SkeletonButton className="hidden h-9 w-24 sm:block" />
          </div>
        </GroupedMenuItem>
      ))}
    </GroupedMenuList>
  );
}
