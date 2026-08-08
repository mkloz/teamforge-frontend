import { UserPlus } from "lucide-react";
import { EmptyState } from "@/shared/components/ui/empty-state";

export function FriendRequestsEmptyState() {
  return (
    <EmptyState
      icon={UserPlus}
      title="No pending requests"
      description="New friend requests will appear here."
    />
  );
}
