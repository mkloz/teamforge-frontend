import { Loader2 } from "lucide-react";

export function FriendRequestsLoadingState() {
  return (
    <div className="flex justify-center py-12">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}
