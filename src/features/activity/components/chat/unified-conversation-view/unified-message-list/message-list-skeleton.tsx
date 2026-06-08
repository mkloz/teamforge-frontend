import { MessageListSkeletonPattern } from "./message-list-skeleton-pattern";

export function MessageListSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading messages"
      className="min-h-full"
      role="status"
    >
      <span className="sr-only">Loading messages</span>
      <MessageListSkeletonPattern />
    </div>
  );
}
