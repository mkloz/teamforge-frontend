import {
  Bookmark,
  Copy,
  Forward,
  type LucideIcon,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActivityMessageActions } from "@/features/activity/hooks/use-activity-message-actions";
import { useSavedMessageIds } from "@/features/activity/hooks/use-saved-message-ids";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import {
  canDeleteMessage,
  canSaveMessage,
} from "@/features/activity/lib/message-action-capabilities";
import { getMessagesClipboardContent } from "@/features/activity/lib/message-clipboard";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { copyTextToClipboard } from "@/shared/lib/browser-capabilities";
import { showAppErrorToast } from "@/shared/lib/error-toast";
import { cn } from "@/shared/lib/utils";
import { ForwardMessageDialog } from "./unified-message-list/unified-message-item/message-actions-menu";

interface MessageSelectionToolbarProps {
  selectedMessages: UnifiedMessage[];
  onClearSelection: () => void;
}

export function MessageSelectionToolbar({
  selectedMessages,
  onClearSelection,
}: MessageSelectionToolbarProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [forwardDialogOpen, setForwardDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const messageActions = useActivityMessageActions();
  const savedMessageIds = useSavedMessageIds();
  const selectedCount = selectedMessages.length;
  const saveableMessages = selectedMessages.filter(canSaveMessage);
  const canForward =
    selectedCount > 0 && selectedMessages.every(canSaveMessage);
  const canDelete =
    selectedCount > 0 && selectedMessages.every(canDeleteMessage);
  const allSaveableMessagesSaved =
    saveableMessages.length > 0 &&
    saveableMessages.every((message) =>
      isMessageSaved(message, savedMessageIds),
    );
  const saveLabel = allSaveableMessagesSaved ? "Unsave" : "Save";

  async function handleCopySelected() {
    const text = getMessagesClipboardContent(selectedMessages);

    if (!(await copyTextToClipboard(text))) {
      toast.error("We couldn't copy those messages in this browser.");
      return;
    }

    toast.success(
      selectedCount === 1 ? "Message copied." : "Messages copied.",
    );
    onClearSelection();
  }

  async function handleToggleSavedSelected() {
    if (saveableMessages.length === 0 || isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      for (const message of saveableMessages) {
        const isSaved = isMessageSaved(message, savedMessageIds);

        if (allSaveableMessagesSaved ? isSaved : !isSaved) {
          await messageActions.toggleSaved(message, isSaved);
        }
      }

      toast.success(
        allSaveableMessagesSaved
          ? "Removed from saved messages."
          : "Saved messages.",
      );
      onClearSelection();
    } catch (error) {
      showAppErrorToast(error, {
        fallbackMessage: "We couldn't update saved messages.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteSelected() {
    if (!canDelete || isDeleting) {
      return;
    }

    setIsDeleting(true);

    try {
      for (const message of selectedMessages) {
        await messageActions.deleteMessage(message);
      }

      toast.success(
        selectedCount === 1 ? "Message deleted." : "Messages deleted.",
      );
      onClearSelection();
    } catch (error) {
      showAppErrorToast(error, {
        fallbackMessage: "We couldn't delete those messages.",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div className="border-border/70 border-t bg-canvas/95 px-3 pt-2 pb-safe-bottom backdrop-blur-xl">
        <div className="mx-auto flex min-h-10 w-full max-w-4xl items-center gap-2">
          <button
            type="button"
            aria-label="Cancel message selection"
            className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border/60 bg-card/70 text-slate-muted transition hover:border-forge-teal/30 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/25"
            onClick={onClearSelection}
          >
            <X className="size-4" aria-hidden="true" />
          </button>

          <span className="min-w-0 flex-1 truncate font-bold text-ink text-sm">
            {selectedCount} selected
          </span>

          <SelectionActionButton
            icon={Copy}
            label="Copy"
            onClick={() => {
              void handleCopySelected();
            }}
          />
          <SelectionActionButton
            disabled={!canForward}
            icon={Forward}
            label="Forward"
            onClick={() => setForwardDialogOpen(true)}
          />
          <SelectionActionButton
            disabled={saveableMessages.length === 0 || isSaving}
            icon={Bookmark}
            label={isSaving ? "Saving" : saveLabel}
            onClick={() => {
              void handleToggleSavedSelected();
            }}
          />
          <SelectionActionButton
            danger
            disabled={!canDelete || isDeleting}
            icon={Trash2}
            label={isDeleting ? "Deleting" : "Delete"}
            onClick={() => setDeleteDialogOpen(true)}
          />
        </div>
      </div>

      <ActionDialog
        cancelLabel="Keep messages"
        confirmLabel={isDeleting ? "Deleting..." : "Delete messages"}
        description={
          selectedCount === 1
            ? "This removes the selected message from the conversation."
            : `This removes ${selectedCount} selected messages from the conversation.`
        }
        onConfirm={handleDeleteSelected}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete selected messages?"
        tone="danger"
      />

      {forwardDialogOpen ? (
        <ForwardMessageDialog
          messages={selectedMessages}
          open={forwardDialogOpen}
          onForwardComplete={onClearSelection}
          onForward={messageActions.forwardMessage}
          onOpenChange={setForwardDialogOpen}
        />
      ) : null}
    </>
  );
}

function SelectionActionButton({
  danger = false,
  disabled = false,
  icon: Icon,
  label,
  onClick,
}: {
  danger?: boolean;
  disabled?: boolean;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-2.5 font-bold text-xs transition focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-45",
        danger
          ? "border-destructive/25 bg-destructive/8 text-destructive hover:bg-destructive/12 focus-visible:ring-destructive/25"
          : "border-border/60 bg-card/70 text-slate-muted hover:border-forge-teal/30 hover:bg-forge-teal/8 hover:text-forge-teal focus-visible:ring-forge-teal/25",
      )}
      disabled={disabled}
      onClick={onClick}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function isMessageSaved(
  message: UnifiedMessage,
  savedMessageIds: ReadonlySet<string>,
) {
  return message.isSaved || savedMessageIds.has(message.id);
}
