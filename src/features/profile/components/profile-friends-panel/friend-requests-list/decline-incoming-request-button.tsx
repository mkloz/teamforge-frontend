import { Loader2, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import type { FriendRequestActionButtonProps } from "./friend-request-action-button.types";

export function DeclineIncomingRequestButton({
  disabled,
  loading,
  onClick,
}: FriendRequestActionButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      disabled={disabled}
      onClick={onClick}
      aria-label="Decline request"
      title="Decline"
      className="size-8 text-muted-foreground hover:text-destructive"
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <X className="size-4" />
      )}
    </Button>
  );
}
