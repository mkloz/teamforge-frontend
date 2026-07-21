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
      className="size-11 text-muted-foreground hover:text-destructive [@media(pointer:fine)]:size-8"
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <X className="size-4" />
      )}
    </Button>
  );
}
