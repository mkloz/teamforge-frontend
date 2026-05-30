import {
  SkeletonAvatar,
  SkeletonButton,
  SkeletonText,
} from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function SettingsActiveSessionsSkeleton() {
  return <SettingsActiveSessionsSkeletonContent />;
}

export function SettingsPreferencesSkeleton() {
  return <SettingsPreferencesSkeletonContent />;
}

export function SettingsBlockedUsersSkeleton() {
  return <SettingsBlockedUsersSkeletonContent />;
}

function SettingsActiveSessionsSkeletonContent() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading active sessions"
      className="border-border border-t"
      role="status"
    >
      <span className="sr-only">Loading active sessions</span>
      {["current", "mobile"].map((item, index) => (
        <div
          key={item}
          className="md:main-action-grid grid gap-4 border-border border-b py-5 last:border-b-0 md:items-center"
        >
          <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-4">
            <Skeleton
              shape="circle"
              className="size-10"
              tone={index === 0 ? "teal" : "default"}
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Skeleton
                  className="h-5 w-32"
                  tone={index === 0 ? "teal" : "default"}
                />
                {index === 0 ? (
                  <Skeleton shape="pill" className="h-5 w-16" tone="teal" />
                ) : null}
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {[0, 1, 2].map((metaItem) => (
                  <div
                    key={metaItem}
                    className="flex min-w-0 items-center gap-2"
                  >
                    <Skeleton shape="circle" className="size-3.5 shrink-0" />
                    <Skeleton className="h-3 min-w-0 flex-1" />
                  </div>
                ))}
              </div>
              <Skeleton className="mt-3 h-3 w-full max-w-80" />
            </div>
          </div>
          <SkeletonButton className="h-10 w-24" />
        </div>
      ))}
    </div>
  );
}

function SettingsPreferencesSkeletonContent() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading preferences"
      className="border-border border-t"
      role="status"
    >
      <span className="sr-only">Loading preferences</span>
      {["one", "two", "three", "four", "five"].map((item, index) => (
        <div
          key={item}
          className="flex w-full items-center justify-between gap-4 border-border border-b py-4 text-left"
        >
          <SkeletonText
            className="min-w-0 flex-1"
            lines={2}
            size="sm"
            widths={index % 2 === 0 ? ["w-40", "w-full"] : ["w-32", "w-5/6"]}
          />
          <Skeleton
            shape="pill"
            className="h-7 w-12 shrink-0"
            tone={index === 0 ? "teal" : "default"}
          />
        </div>
      ))}
    </div>
  );
}

function SettingsBlockedUsersSkeletonContent() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading blocked users"
      className="border-border border-t"
      role="status"
    >
      <span className="sr-only">Loading blocked users</span>
      {["first", "second"].map((item) => (
        <div
          key={item}
          className="flex items-center gap-4 border-border border-b py-5 last:border-b-0"
        >
          <SkeletonAvatar className="size-11" />
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
  );
}
