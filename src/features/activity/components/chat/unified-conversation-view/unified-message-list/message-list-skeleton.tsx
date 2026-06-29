import { MessageListSkeletonPattern } from "./message-list-skeleton-pattern";

export function MessageListSkeleton() {
  return (
    <div aria-busy="true" className="min-h-full">
      <output className="sr-only">Loading messages</output>
      <MessageListSkeletonPattern />
    </div>
  );
}
