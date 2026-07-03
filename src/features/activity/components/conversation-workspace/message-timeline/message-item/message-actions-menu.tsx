import { useRef } from "react";
import { getActivityTransparentMenuContentClass } from "@/features/activity/components/activity-popup-styles";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "@/shared/components/ui/context-menu";
import { getBrowserDocument } from "@/shared/lib/browser-environment";
import { scheduleDelay } from "@/shared/lib/browser-scheduling";
import { showAppErrorToast } from "@/shared/lib/error-toast";
import { DeleteMessageDialog } from "./delete-message-dialog";
import { ForwardMessageDialog } from "./forward-message-dialog";
import { MessageActionSections } from "./message-action-list";
import type { MessageContextMenuProps } from "./message-actions-menu.types";
import { MessageReactionPicker } from "./message-reaction-picker";
import {
  type MessageActionMenu,
  useMessageActionMenu,
} from "./use-message-action-menu";

export { ForwardMessageDialog };

const MENU_CONTENT_CLASS = getActivityTransparentMenuContentClass("w-[16rem]");

const EMPTY_SELECTED_REACTION_EMOJIS: readonly string[] = [];

export function MessageContextMenu({
  children,
  message,
  onDelete,
  onPin,
  onReply,
  onRetry,
  onStartEdit,
  onForward,
  onToggleReaction,
  reactionPickerDisabled = false,
  selectedReactionEmojis = EMPTY_SELECTED_REACTION_EMOJIS,
  onUnpin,
  isSaved = false,
  onToggleSaved,
  onSelectMessage,
  onOpenChange,
  isOnline = true,
}: MessageContextMenuProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const menu = useMessageActionMenu({
    message,
    onPin,
    onReply,
    onRetry,
    onStartEdit,
    onForward,
    reactionPickerDisabled,
    selectedReactionEmojis,
    onUnpin,
    isSaved,
    onToggleSaved,
    onSelectMessage,
  });
  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange?.(nextOpen);
  };
  const handleSelectReaction = (emoji: string) => {
    void Promise.resolve(onToggleReaction(message, emoji)).catch(
      showReactionError,
    );
  };
  const requestClose = () => {
    handleOpenChange(false);
    scheduleDelay(() => {
      const menuElement =
        contentRef.current ??
        getBrowserDocument()?.querySelector("[role='menu']");

      menuElement?.dispatchEvent(
        new KeyboardEvent("keydown", {
          bubbles: true,
          code: "Escape",
          key: "Escape",
        }),
      );
    }, 50);
  };

  return (
    <>
      <ContextMenu modal={false} onOpenChange={handleOpenChange}>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
        <ContextMenuContent
          ref={contentRef}
          aria-label="Message actions"
          className={MENU_CONTENT_CLASS}
        >
          <MessageMenuSurface
            menu={menu}
            onSelectReaction={handleSelectReaction}
            onRequestClose={requestClose}
          />
        </ContextMenuContent>
      </ContextMenu>

      <DeleteMessageDialog
        message={message}
        open={menu.deleteDialogOpen}
        onDelete={onDelete}
        onOpenChange={menu.setDeleteDialogOpen}
      />
      {menu.forwardDialogOpen ? (
        <ForwardMessageDialog
          message={message}
          open={menu.forwardDialogOpen}
          isOnline={isOnline}
          onForward={onForward}
          onOpenChange={menu.setForwardDialogOpen}
        />
      ) : null}
    </>
  );
}

function MessageMenuSurface({
  menu,
  onRequestClose,
  onSelectReaction,
}: {
  menu: MessageActionMenu;
  onRequestClose: () => void;
  onSelectReaction: (emoji: string) => void;
}) {
  return (
    <>
      <MessageReactionPicker
        canReact={menu.canReact}
        selectedReactionEmojis={menu.selectedReactionEmojis}
        onRequestClose={onRequestClose}
        onSelectReaction={onSelectReaction}
      />
      <MessageActionSections
        dangerActions={menu.dangerActions}
        primaryActions={menu.primaryActions}
      />
    </>
  );
}

function showReactionError(error: unknown) {
  showAppErrorToast(error, {
    fallbackMessage: "We couldn't update that reaction.",
  });
}
