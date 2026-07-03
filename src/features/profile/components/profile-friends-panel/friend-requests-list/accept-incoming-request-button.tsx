import { Check, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import type { FriendRequestActionButtonProps } from "./friend-request-action-button.types";

export function AcceptIncomingRequestButton({
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
      aria-label="Accept request"
      title="Accept"
      className="size-8 text-muted-foreground hover:text-forge-teal"
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Check className="size-4" />
      )}
    </Button>
  );
}
