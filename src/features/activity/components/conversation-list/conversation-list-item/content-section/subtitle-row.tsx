import { lazy, Suspense } from "react";
import type { UnifiedConversation } from "@/features/activity/lib/activity-contract";
import { UnreadBadge } from "@/shared/components/common/unread-badge";
import { cn } from "@/shared/lib/utils";
import type { ContentSectionViewState } from "../content-section-view-state";
import { MsgStatusIcon } from "../msg-status-icon";
import { SubtitleIcon } from "../subtitle-icon";

const UnifiedTypingIndicator = lazy(() =>
  import("@/features/activity/components/chat/unified-typing-indicator").then(
    (module) => ({
      default: module.UnifiedTypingIndicator,
    }),
  ),
);

const TYPING_DOT_FALLBACK_INDICES = [0, 1, 2] as const;

export function ConversationSubtitleRow({
  item,
  isCompact,
  isGroup,
  isSavedView,
  viewState,
}: {
  item: UnifiedConversation;
  isCompact: boolean;
  isGroup: boolean;
  isSavedView: boolean;
  viewState: ContentSectionViewState;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2",
        isCompact ? "mt-0" : "mt-0.5",
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        <MessageStatusSlot
          isCompact={isCompact}
          isGroup={isGroup}
          viewState={viewState}
        />
        <div className="flex min-w-0 items-center gap-1 overflow-hidden">
          <SubtitleIcon
            type={viewState.previewMessage?.type}
            isCompact={isCompact}
          />

          <ConversationSubtitlePreview
            isCompact={isCompact}
            isSavedView={isSavedView}
            isTyping={item.isTyping}
            viewState={viewState}
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <UnreadBadge count={item.unreadCount} isCompact={isCompact} />
      </div>
    </div>
  );
}

function MessageStatusSlot({
  isCompact,
  isGroup,
  viewState,
}: {
  isCompact: boolean;
  isGroup: boolean;
  viewState: ContentSectionViewState;
}) {
  const status = getMessageStatusForSlot({ isGroup, viewState });

  return (
    <span className="shrink-0">
      {status ? <MsgStatusIcon status={status} isCompact={isCompact} /> : null}
    </span>
  );
}

function getMessageStatusForSlot({
  isGroup,
  viewState,
}: {
  isGroup: boolean;
  viewState: ContentSectionViewState;
}) {
  return isGroup ? null : getOwnLatestMessageStatus(viewState);
}

function getOwnLatestMessageStatus(viewState: ContentSectionViewState) {
  return viewState.latestMessage?.isOwn
    ? (viewState.latestMessage.status ?? null)
    : null;
}

function ConversationSubtitlePreview({
  isCompact,
  isSavedView,
  isTyping,
  viewState,
}: {
  isCompact: boolean;
  isSavedView: boolean;
  isTyping: boolean | undefined;
  viewState: ContentSectionViewState;
}) {
  if (shouldShowTypingPreview({ isSavedView, isTyping })) {
    return <TypingPreview isCompact={isCompact} />;
  }

  return (
    <p
      className={cn(
        "truncate leading-tight",
        "text-xs",
        getSubtitleTextClassName(viewState.hasUnread),
        viewState.previewMessage?.isSystem && "text-slate-muted/60 italic",
      )}
    >
      {viewState.subtitle}
    </p>
  );
}

function shouldShowTypingPreview({
  isSavedView,
  isTyping,
}: {
  isSavedView: boolean;
  isTyping: boolean | undefined;
}) {
  return Boolean(isTyping) && !isSavedView;
}

function getSubtitleTextClassName(hasUnread: boolean) {
  return hasUnread
    ? "font-bold text-ink"
    : "text-slate-muted/80 group-hover/item:text-slate-muted";
}

function TypingPreview({ isCompact }: { isCompact: boolean }) {
  return (
    <div className="fade-in slide-in-from-left-2 flex animate-in items-baseline gap-1 duration-300">
      <span
        className={cn("font-bold text-foreground leading-tight", "text-xs")}
      >
        typing
      </span>
      <Suspense
        fallback={
          <TypingDotsFallback className={isCompact ? "h-2" : "h-2.5"} />
        }
      >
        <UnifiedTypingIndicator
          variant="minimal"
          className={isCompact ? "h-2" : "h-2.5"}
        />
      </Suspense>
    </div>
  );
}

function TypingDotsFallback({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-end justify-start gap-1", className)}>
      {TYPING_DOT_FALLBACK_INDICES.map((index) => (
        <span
          key={index}
          className="mb-0.5 size-1 rounded-full bg-brand-teal/70 opacity-60"
        />
      ))}
    </span>
  );
}
