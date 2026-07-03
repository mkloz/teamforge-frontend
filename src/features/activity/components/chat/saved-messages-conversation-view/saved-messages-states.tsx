import { RefreshCw, Search } from "lucide-react";
import { NoSavedMessagesVisual } from "@/features/activity/assets/no-saved-messages";
import { Button } from "@/shared/components/ui/button";
import { IconTile } from "@/shared/components/ui/icon-tile";
import type { SavedMessagesStateViewState } from "../saved-messages-conversation-view-state";

export function SavedMessagesLoadingState() {
  const placeholders = [
    "saved-message-loading-1",
    "saved-message-loading-2",
    "saved-message-loading-3",
    "saved-message-loading-4",
  ];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
      {placeholders.map((key) => (
        <div
          key={key}
          className="h-28 animate-pulse rounded-2xl border border-border/60 bg-card/70 motion-reduce:animate-none"
        />
      ))}
    </div>
  );
}

export function SavedMessagesState({
  actionDisabled = false,
  actionLabel,
  description,
  icon,
  onAction,
  title,
}: {
  onAction?: () => Promise<void> | void;
} & SavedMessagesStateViewState) {
  return (
    <div className="flex h-full min-h-80 items-center justify-center px-4 text-center">
      <div className="flex max-w-sm flex-col items-center gap-3">
        <SavedMessagesStateVisual icon={icon} />
        <div>
          <h2 className="font-black text-ink text-lg tracking-tight">
            {title}
          </h2>
          <p className="mt-1 text-slate-muted text-sm leading-relaxed">
            {description}
          </p>
        </div>
        <SavedMessagesStateAction
          actionDisabled={actionDisabled}
          actionLabel={actionLabel}
          onAction={onAction}
        />
      </div>
    </div>
  );
}

function SavedMessagesStateVisual({
  icon,
}: {
  icon: SavedMessagesStateViewState["icon"];
}) {
  if (icon === "saved") {
    return <NoSavedMessagesVisual className="h-36 w-auto text-foreground" />;
  }

  const Icon = icon === "retry" ? RefreshCw : Search;

  return (
    <IconTile
      icon={Icon}
      iconClassName="size-5"
      size="xl"
      shape="circle"
      tone="teal"
      bordered
      className="border-primary/15 bg-primary/8"
    />
  );
}

function SavedMessagesStateAction({
  actionDisabled,
  actionLabel,
  onAction,
}: {
  actionDisabled?: boolean;
  actionLabel?: string;
  onAction?: () => Promise<void> | void;
}) {
  if (!actionLabel || !onAction) {
    return null;
  }

  return (
    <Button
      disabled={actionDisabled}
      size="sm"
      variant="primary"
      onClick={() => void onAction()}
    >
      {actionLabel}
    </Button>
  );
}
