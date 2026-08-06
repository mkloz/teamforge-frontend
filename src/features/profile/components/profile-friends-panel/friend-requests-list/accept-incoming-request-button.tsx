import { Check } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
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
      className="size-11 text-muted-foreground hover:text-forge-teal [@media(pointer:fine)]:size-8"
    >
      {loading ? (
        <Spinner aria-hidden="true" className="size-4" />
      ) : (
        <Check className="size-4" />
      )}
    </Button>
  );
}
