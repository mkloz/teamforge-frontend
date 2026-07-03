import type { KeyboardEvent } from "react";
import type { SavedMessageSnapshot } from "@/features/activity/lib/saved-message";
import { cn } from "@/shared/lib/utils";
import { MessageContent } from "../../conversation-workspace/message-timeline/message-item/message-content";
import { MessageFooter } from "../../conversation-workspace/message-timeline/message-item/message-footer";
import { MessageMedia } from "../../conversation-workspace/message-timeline/message-item/message-media";
import { ReplyReference } from "../../conversation-workspace/message-timeline/message-item/reply-reference";
import {
  isSavedMessageOpenKey,
  type SavedMessageBubbleViewState,
} from "../saved-messages-conversation-view-state";
import { ForwardedIndicator } from "./saved-message-forwarded-indicator";
import type { SavedMessageLayoutState } from "./types";

interface SavedMessageOpenTargetProps {
  bubbleSizeClass: string;
  galleryRounding: string;
  isReadByOthers: boolean;
  message: SavedMessageSnapshot["message"];
  onOpen: () => void;
  reactionGroups: SavedMessageLayoutState["reactionGroups"];
  usesInlineFooter: boolean;
  viewState: SavedMessageBubbleViewState;
}

export function SavedMessageOpenTarget({
  bubbleSizeClass,
  galleryRounding,
  isReadByOthers,
  message,
  onOpen,
  reactionGroups,
  usesInlineFooter,
  viewState,
}: SavedMessageOpenTargetProps) {
  function handleOpenKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.currentTarget !== event.target) {
      return;
    }

    if (isSavedMessageOpenKey(event.key)) {
      event.preventDefault();
      onOpen();
    }
  }

  return (
    // biome-ignore lint/a11y/useSemanticElements: Saved bubbles contain nested action buttons, so they cannot be native buttons.
    <div
      tabIndex={0}
      // react-doctor-disable-next-line react-doctor/prefer-tag-over-role -- Saved bubbles contain nested action buttons, so replacing this open target with a native button would create invalid interactive nesting.
      role="button"
      aria-label={`Open original saved message from ${viewState.senderName}`}
      className={cn(
        "relative flex min-w-0 cursor-pointer flex-col rounded-xl rounded-tl-none px-1 py-1 text-left shadow-xs transition duration-300",
        bubbleSizeClass,
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
        viewState.isOwn
          ? "border border-primary/15 bg-primary/8 text-ink shadow-sm backdrop-blur-md"
          : "border border-border/60 bg-card/75 text-ink shadow-sm backdrop-blur-md",
        !viewState.displayContent && "min-w-30",
        usesInlineFooter && "min-w-40",
      )}
      onClick={onOpen}
      onKeyDown={handleOpenKeyDown}
    >
      <SavedMessageOpenTargetContents
        galleryRounding={galleryRounding}
        isReadByOthers={isReadByOthers}
        message={message}
        onOpen={onOpen}
        reactionGroups={reactionGroups}
        viewState={viewState}
      />
    </div>
  );
}

function SavedMessageOpenTargetContents({
  galleryRounding,
  isReadByOthers,
  message,
  onOpen,
  reactionGroups,
  viewState,
}: Omit<SavedMessageOpenTargetProps, "bubbleSizeClass" | "usesInlineFooter">) {
  return (
    <>
      <ForwardedIndicator message={message} isOwn={viewState.isOwn} />

      <ReplyReference
        replyTo={message.replyTo}
        isOwn={viewState.isOwn}
        onActivate={() => onOpen()}
      />

      <MessageMedia
        attachments={message.attachments}
        isOwn={viewState.isOwn}
        content={viewState.displayContent}
        createdAt={message.createdAt}
        status={message.status}
        isReadByOthers={isReadByOthers}
        galleryRounding={galleryRounding}
        reactionGroupsLength={reactionGroups.length}
        replyTo={message.replyTo}
      />

      <MessageContent
        content={viewState.displayContent}
        hasReply={Boolean(message.replyTo)}
        isOwn={viewState.isOwn}
        reactionGroupsLength={reactionGroups.length}
      />

      <MessageFooter
        attachments={message.attachments}
        content={viewState.displayContent}
        createdAt={message.createdAt}
        footerState={{
          hasReply: Boolean(message.replyTo),
          isEdited: message.isEdited,
          isOwn: viewState.isOwn,
          isPinned: message.isPinned,
          isReadByOthers,
          isSaved: true,
        }}
        reactionGroups={reactionGroups}
        status={message.status}
      />
    </>
  );
}
