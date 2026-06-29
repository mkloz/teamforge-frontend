import { RefreshCw } from "lucide-react";
import { EmptyMessageThreadVisual } from "@/features/activity/assets/empty-message-thread";
import { ErrorNetworkRetryVisual } from "@/features/activity/assets/error-network-retry";
import { MyNotesNoMessagesVisual } from "@/features/activity/assets/my-notes-no-messages";
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
  const description = isMyNotes
    ? "Keep private thoughts here before they become a plan."
    : "Start the thread when you are ready to plan together.";

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 py-10 text-center">
      <output className="sr-only">No messages yet. {description}</output>
      <div className="flex max-w-xs flex-col items-center">
        <Visual className="h-32 w-auto text-foreground" />
        <p className="mt-4 font-semibold text-foreground text-sm">
          No messages yet
        </p>
        <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

export function MessageListErrorState({
  isOffline,
  onRetry,
}: MessageListErrorStateProps) {
  const title = isOffline
    ? "Messages need a connection"
    : "Messages did not load";
  const description = isOffline
    ? "Reconnect to fetch this thread."
    : "Retry to bring the latest conversation back.";

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 py-10 text-center">
      <output className="sr-only">
        {title}. {description}
      </output>
      <div className="flex max-w-xs flex-col items-center">
        <ErrorNetworkRetryVisual className="h-32 w-auto text-foreground" />
        <p className="mt-3 font-semibold text-foreground text-sm">{title}</p>
        <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
          {description}
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
