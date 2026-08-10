import { RefreshCw } from "lucide-react";
import { ErrorNetworkRetryVisual } from "@/features/activity/assets/error-network-retry";
import { Button } from "@/shared/components/ui/button";
import { OfflineNotice } from "@/shared/components/ui/offline-notice";
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
  const defaultDescription = "We couldn't load your conversations. Try again.";
  const title = isOffline
    ? "You are offline"
    : (titleProp ?? "Conversations did not load");
  const description = isOffline
    ? "Reconnect to refresh your conversations."
    : (descriptionProp ?? defaultDescription);

  return (
    <div className="flex min-h-[calc(100dvh-8rem)] flex-col items-center justify-center px-6 py-12 text-center">
      <output className="sr-only">
        {title}. {description}
      </output>
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
    <OfflineNotice
      size="xs"
      className={cn(
        "mx-4 my-2 border-brand-amber/30 bg-accent-soft",
        className,
      )}
      contentClassName="font-medium text-ink leading-relaxed"
    >
      <p>
        <span className="font-black text-brand-amber">Offline.</span> Cached
        chats stay visible; new updates will resume when you reconnect.
      </p>
    </OfflineNotice>
  );
}
