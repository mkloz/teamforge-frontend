import {
  SkeletonButton,
  SkeletonText,
} from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

export function SettingsSidebarSkeleton({
  isMobileDetailOpen,
}: {
  isMobileDetailOpen: boolean;
}) {
  return (
    <aside className={cn("lg:block", isMobileDetailOpen && "hidden")}>
      <div className="lg:fixed lg:top-10 lg:max-h-[calc(100svh-5rem)] lg:w-72 lg:overflow-y-auto lg:pr-1">
        <div className="mb-5 border-border border-b pb-5 lg:border-b-0 lg:pb-0">
          <Skeleton className="h-8 w-32" tone="teal" />
          <SkeletonText
            className="mt-3 max-w-52"
            lines={2}
            size="sm"
            widths={["w-full", "w-4/5"]}
          />
        </div>
        <div className="flex flex-col overflow-hidden">
          {[
            "account",
            "appearance",
            "matching",
            "privacy",
            "security",
            "safety",
            "notifications",
          ].map((item, index) => (
            <div
              key={item}
              className={cn(
                "relative flex items-center justify-between gap-3 border-border border-b px-1 py-2 last:border-b-0 lg:items-start lg:border-b-0 lg:px-4",
                index === 0 &&
                  "after:absolute after:top-2.5 after:bottom-2.5 after:left-0 after:w-0.5 after:bg-primary",
              )}
            >
              <Skeleton
                shape="circle"
                className="size-8"
                tone={index === 0 ? "teal" : "default"}
              />
              <div className="min-w-0 flex-1">
                <Skeleton
                  className={cn("h-4", index === 2 ? "w-20" : "w-24")}
                  tone={index === 0 ? "teal" : "default"}
                />
                <Skeleton className="mt-2 h-3 w-full max-w-36" />
              </div>
              <Skeleton shape="circle" className="size-4 shrink-0 lg:hidden" />
            </div>
          ))}
        </div>
        <div className="mt-5 border-border border-y py-1 lg:border-x-0 lg:border-t lg:border-b-0 lg:py-4">
          <SkeletonButton className="h-10 w-full" />
        </div>
      </div>
    </aside>
  );
}
