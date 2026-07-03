import { useMessageLayout } from "@/features/activity/hooks/use-message-layout";
import { Avatar } from "@/shared/components/common/avatar";
import {
  getSavedMessageBubbleSizeClass,
  getSavedMessageBubbleViewState,
  getSavedMessageGalleryRounding,
  type SavedMessageRow,
  shouldUseSavedMessageInlineFooter,
} from "../saved-messages-conversation-view-state";
import { SavedMessageBubbleActions } from "./saved-message-bubble-actions";
import { SavedMessageBubbleHeader } from "./saved-message-bubble-header";
import { SavedMessageOpenTarget } from "./saved-message-open-target";

interface SavedMessageBubbleProps {
  row: SavedMessageRow;
  onOpen: () => void;
  onRemove: () => Promise<void> | void;
}

export function SavedMessageBubble({
  row,
  onOpen,
  onRemove,
}: SavedMessageBubbleProps) {
  const { message } = row.snapshot;
  const viewState = getSavedMessageBubbleViewState(row);
  const { galleryRounding, isReadByOthers, reactionGroups } = useMessageLayout({
    message,
    isOwn: viewState.isOwn,
  });
  const savedGalleryRounding = getSavedMessageGalleryRounding(galleryRounding);
  const bubbleSizeClass = getSavedMessageBubbleSizeClass({
    content: viewState.displayContent,
    hasContextPreview: viewState.hasContextPreview,
    hasVisualAttachments: viewState.hasVisualAttachments,
    visualAttachmentCount: viewState.visualAttachmentCount,
  });
  const usesInlineFooter = shouldUseSavedMessageInlineFooter({
    displayContent: viewState.displayContent,
    hasReply: Boolean(message.replyTo),
    reactionGroupsLength: reactionGroups.length,
  });

  return (
    <article className="group/saved-message flex w-full min-w-0 items-start gap-2.5 sm:gap-3">
      <Avatar
        src={message.sender?.avatar}
        name={viewState.senderName}
        className="mt-6 size-8 bg-muted text-muted-foreground text-xs shadow-sm ring-1 ring-border"
        fallbackClassName="text-muted-foreground"
      />

      <div className="flex min-w-0 flex-1 flex-col items-start">
        <SavedMessageBubbleHeader
          conversationTitle={row.conversationTitle}
          isOwn={viewState.isOwn}
          savedAt={viewState.savedAt}
          senderName={viewState.senderName}
        />

        <SavedMessageOpenTarget
          bubbleSizeClass={bubbleSizeClass}
          galleryRounding={savedGalleryRounding}
          isReadByOthers={isReadByOthers}
          message={message}
          onOpen={onOpen}
          reactionGroups={reactionGroups}
          usesInlineFooter={usesInlineFooter}
          viewState={viewState}
        />

        <SavedMessageBubbleActions onRemove={onRemove} />
      </div>
    </article>
  );
}
