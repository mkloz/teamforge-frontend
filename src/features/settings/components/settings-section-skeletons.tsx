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
          <div className="flex min-w-0 items-center gap-3">
            <Skeleton
              shape="square"
              className="size-10"
              tone={index === 0 ? "teal" : "default"}
            />
            <SkeletonText
              className="min-w-0 flex-1"
              lines={2}
              widths={["w-44", "w-64"]}
            />
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
      className="grid gap-0 border-border border-t lg:grid-cols-3 lg:gap-8"
      role="status"
    >
      <span className="sr-only">Loading preferences</span>
      {["one", "two", "three", "four", "five"].map((item, index) => (
        <div
          key={item}
          className="flex items-start justify-between gap-4 border-border border-b py-5 lg:border-b-0"
        >
          <SkeletonText
            className="min-w-0 flex-1"
            lines={2}
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
          className="flex items-center gap-3 border-border border-b py-5 last:border-b-0"
        >
          <SkeletonAvatar className="size-11" />
          <SkeletonText
            className="flex-1"
            lines={2}
            widths={["w-36", "w-48"]}
          />
          <SkeletonButton className="h-10 w-24" />
        </div>
      ))}
    </div>
  );
}
