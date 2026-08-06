import { Spinner } from "@/shared/components/ui/spinner";

export function FriendRequestsLoadingState() {
  return (
    <div className="flex justify-center py-12" role="status" aria-live="polite">
      <Spinner aria-hidden="true" className="size-6 text-muted-foreground" />
      <span className="sr-only">Loading friend requests</span>
    </div>
  );
}
