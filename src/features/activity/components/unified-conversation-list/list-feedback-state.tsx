import { RefreshCw, WifiOff } from "lucide-react";
import { ErrorNetworkRetryVisual } from "@/assets/error-state/error-network-retry";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface ConversationListErrorStateProps {
  description?: string;
  isOffline: boolean;
  isRetrying?: boolean;
  title?: string;
  onRetry: () => Promise<void> | void;
}

interface ConversationListOfflineBannerProps {
  className?: string;
}

export function ConversationListErrorState({
  description: descriptionProp,
  isOffline,
  isRetrying = false,
  title: titleProp,
  onRetry,
}: ConversationListErrorStateProps) {
  const defaultDescription =
    "Something interrupted the chat list. Retry to bring everything back.";
  const title = isOffline
    ? "You are offline"
    : (titleProp ?? "Conversations did not load");
  const description = isOffline
    ? "Reconnect to refresh your chats and keep planning."
    : (descriptionProp ?? defaultDescription);

  return (
    <div
      className="flex min-h-[calc(100dvh-8rem)] flex-col items-center justify-center px-6 py-12 text-center"
      role="status"
    >
      <ErrorNetworkRetryVisual className="h-28 w-auto text-foreground" />
      <div className="mt-5 max-w-60">
        <p className="font-black text-base text-foreground leading-tight">
          {title}
        </p>
        <p className="mt-2 font-medium text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      </div>
      <Button
        className="mt-5 rounded-lg"
        loading={isRetrying}
        size="sm"
        variant="primary"
        onClick={() => void onRetry()}
      >
        <RefreshCw size={14} />
        Try again
      </Button>
    </div>
  );
}

export function ConversationListOfflineBanner({
  className,
}: ConversationListOfflineBannerProps) {
  return (
    <div
      className={cn(
        "mx-4 my-2 flex items-start gap-2 rounded-xl border border-spark-amber/30 bg-spark-amber/10 px-3 py-2 text-left",
        className,
      )}
      role="status"
    >
      <WifiOff
        aria-hidden="true"
        className="mt-0.5 size-4 shrink-0 text-spark-amber"
      />
      <p className="font-medium text-ink text-xs leading-relaxed">
        <span className="font-black text-spark-amber">Offline.</span> Cached
        chats stay visible; new updates will resume when you reconnect.
      </p>
    </div>
  );
}
