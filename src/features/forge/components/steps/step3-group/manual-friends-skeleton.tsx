import {
  SkeletonAvatar,
  SkeletonText,
} from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function ManualFriendsSkeleton() {
  return <ManualFriendsSkeletonContent />;
}

function ManualFriendsSkeletonContent() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading friends"
      className="flex flex-col gap-2"
      role="status"
    >
      <span className="sr-only">Loading friends</span>
      {["maya", "cody", "noah"].map((item, index) => (
        <div
          key={item}
          className="flex items-center gap-3 rounded-lg border border-border/45 bg-card p-3"
        >
          <SkeletonAvatar
            className="size-11"
            tone={index === 1 ? "teal" : "default"}
          />
          <SkeletonText
            className="min-w-0 flex-1"
            lines={2}
            size="sm"
            widths={["w-32", "w-48"]}
          />
          <Skeleton
            shape="circle"
            className="size-8"
            tone={index === 1 ? "amber" : "default"}
          />
        </div>
      ))}
    </div>
  );
}
