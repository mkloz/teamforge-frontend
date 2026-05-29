import { RefreshCw } from "lucide-react";
import { EmptyMessageThreadVisual } from "@/assets/empty-state/empty-message-thread";
import { MyNotesNoMessagesVisual } from "@/assets/empty-state/my-notes-no-messages";
import { ErrorNetworkRetryVisual } from "@/assets/error-state/error-network-retry";
import { Button } from "@/shared/components/ui/button";

interface MessageListErrorStateProps {
  isOffline: boolean;
  onRetry?: () => Promise<void> | void;
}

type MessageListEmptyVariant = "default" | "my-notes";

interface MessageListEmptyStateProps {
  variant?: MessageListEmptyVariant;
}

export function MessageListEmptyState({
  variant = "default",
}: MessageListEmptyStateProps) {
  const isMyNotes = variant === "my-notes";
  const Visual = isMyNotes ? MyNotesNoMessagesVisual : EmptyMessageThreadVisual;

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center px-6 py-10 text-center"
      role="status"
    >
      <div className="flex max-w-xs flex-col items-center">
        <Visual className="h-32 w-auto text-foreground" />
        <p className="mt-4 font-semibold text-foreground text-sm">
          No messages yet
        </p>
        <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
          {isMyNotes
            ? "Keep private thoughts here before they become a plan."
            : "Start the thread when you are ready to plan together."}
        </p>
      </div>
    </div>
  );
}

export function MessageListErrorState({
  isOffline,
  onRetry,
}: MessageListErrorStateProps) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center px-6 py-10 text-center"
      role="status"
    >
      <div className="flex max-w-xs flex-col items-center">
        <ErrorNetworkRetryVisual className="h-32 w-auto text-foreground" />
        <p className="mt-3 font-semibold text-foreground text-sm">
          {isOffline ? "Messages need a connection" : "Messages did not load"}
        </p>
        <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
          {isOffline
            ? "Reconnect to fetch this thread."
            : "Retry to bring the latest conversation back."}
        </p>
        {onRetry ? (
          <Button
            className="mt-4 rounded-lg"
            size="sm"
            variant="primary"
            onClick={() => void onRetry()}
          >
            <RefreshCw size={14} />
            Try again
          </Button>
        ) : null}
      </div>
    </div>
  );
}
