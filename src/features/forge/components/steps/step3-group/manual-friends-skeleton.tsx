import {
  SkeletonAvatar,
  SkeletonCard,
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
        <SkeletonCard key={item} className="p-3">
          <div className="flex items-center gap-3">
            <SkeletonAvatar
              className="size-10"
              tone={index === 1 ? "teal" : "default"}
            />
            <SkeletonText
              className="flex-1"
              lines={2}
              widths={["w-32", "w-48"]}
            />
            <Skeleton
              shape="circle"
              className="size-5"
              tone={index === 1 ? "teal" : "default"}
            />
          </div>
        </SkeletonCard>
      ))}
    </div>
  );
}
