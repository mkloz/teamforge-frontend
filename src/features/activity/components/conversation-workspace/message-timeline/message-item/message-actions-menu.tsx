import { Flag } from "lucide-react";
import { useRef, useState } from "react";
import {
  ACTIVITY_MENU_ITEM_CLASS,
  ACTIVITY_MENU_SEPARATOR_CLASS,
  getActivityTransparentMenuContentClass,
} from "@/features/activity/components/activity-popup-styles";
import {
  blockReportedUser,
  ReportDialog,
  type ReportTarget,
} from "@/features/reporting/public/reporting";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
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
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
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
        <ContextMenuTrigger asChild>
          <div className="contents">{children}</div>
        </ContextMenuTrigger>
        <ContextMenuContent
          ref={contentRef}
          aria-label="Message actions"
          className={MENU_CONTENT_CLASS}
        >
          <MessageMenuSurface
            canReport={canReportMessage(message)}
            menu={menu}
            onReport={() => setReportDialogOpen(true)}
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
      {reportDialogOpen ? (
        <ReportDialog
          canRequestBlock
          onBlock={() =>
            blockReportedUser(message.sender?.id ?? message.senderId)
          }
          open={reportDialogOpen}
          onOpenChange={setReportDialogOpen}
          targets={getMessageReportTargets(message)}
        />
      ) : null}
    </>
  );
}

function MessageMenuSurface({
  canReport,
  menu,
  onReport,
  onRequestClose,
  onSelectReaction,
}: {
  canReport: boolean;
  menu: MessageActionMenu;
  onReport: () => void;
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
      {canReport ? (
        <>
          <ContextMenuSeparator className={ACTIVITY_MENU_SEPARATOR_CLASS} />
          <ContextMenuItem
            className={ACTIVITY_MENU_ITEM_CLASS}
            onSelect={onReport}
          >
            <Flag className="size-4" aria-hidden="true" />
            <span className="font-bold text-xs">Report message</span>
          </ContextMenuItem>
        </>
      ) : null}
    </>
  );
}

function canReportMessage(message: MessageContextMenuProps["message"]) {
  return !message.isOwn && !message.isSystem && !message.proposal;
}

function getMessageReportTargets(
  message: MessageContextMenuProps["message"],
): ReportTarget[] {
  const senderName = message.sender?.name ?? "this person";
  const messageTarget: ReportTarget = {
    id: message.id,
    label: `Message from ${senderName}`,
    type: "MESSAGE",
  };
  const attachmentTargets =
    message.attachments?.map((attachment, index) => ({
      id: attachment.id,
      label: attachment.name
        ? `Attachment: ${attachment.name}`
        : `Attachment ${index + 1} from ${senderName}`,
      relatedMessageIds: [message.id],
      type: "ATTACHMENT" as const,
    })) ?? [];

  return [messageTarget, ...attachmentTargets];
}

function showReactionError(error: unknown) {
  showAppErrorToast(error, {
    fallbackMessage: "We couldn't update that reaction.",
  });
}
