import {
  SkeletonAvatar,
  SkeletonButton,
  SkeletonCard,
  SkeletonList,
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
      className="flex flex-col gap-3"
      role="status"
    >
      <span className="sr-only">Loading active sessions</span>
      {["current", "mobile"].map((item, index) => (
        <SkeletonCard key={item} className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
            <SkeletonButton className="w-24" />
          </div>
        </SkeletonCard>
      ))}
    </div>
  );
}

function SettingsPreferencesSkeletonContent() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading preferences"
      className="flex flex-col gap-3"
      role="status"
    >
      <span className="sr-only">Loading preferences</span>
      <SkeletonList
        count={5}
        renderItem={(index) => (
          <SkeletonCard className="p-4">
            <div className="flex items-center justify-between gap-4">
              <SkeletonText
                className="flex-1"
                lines={2}
                widths={index % 2 === 0 ? ["w-40", "w-64"] : ["w-32", "w-56"]}
              />
              <Skeleton
                shape="pill"
                className="h-7 w-12"
                tone={index === 0 ? "teal" : "default"}
              />
            </div>
          </SkeletonCard>
        )}
      />
    </div>
  );
}

function SettingsBlockedUsersSkeletonContent() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading blocked users"
      className="flex flex-col gap-3"
      role="status"
    >
      <span className="sr-only">Loading blocked users</span>
      {["first", "second"].map((item) => (
        <SkeletonCard key={item} className="p-4">
          <div className="flex items-center gap-3">
            <SkeletonAvatar className="size-11" />
            <SkeletonText
              className="flex-1"
              lines={2}
              widths={["w-36", "w-48"]}
            />
            <SkeletonButton className="w-24" />
          </div>
        </SkeletonCard>
      ))}
    </div>
  );
}
