import {
  SkeletonAvatar,
  SkeletonButton,
  SkeletonText,
} from "@/shared/components/loading/skeleton-patterns";

export function SettingsBlockedUsersSkeleton() {
  return (
    <div aria-busy="true" className="border-border border-t">
      <output className="sr-only">Loading blocked users</output>
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
