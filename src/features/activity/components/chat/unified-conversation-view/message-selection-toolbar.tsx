import {
  Bookmark,
  Copy,
  Forward,
  type LucideIcon,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { useActivityMessageActions } from "@/features/activity/hooks/use-activity-message-actions";
import { useSavedMessageIds } from "@/features/activity/hooks/use-saved-message-ids";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { getMessagesClipboardContent } from "@/features/activity/lib/message-clipboard";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";
import {
  showAppErrorMessageToast,
  showAppInfoToast,
  showAppSuccessToast,
} from "@/shared/lib/app-toast";
import { copyTextToClipboard } from "@/shared/lib/browser-capabilities";
import { showAppErrorToast } from "@/shared/lib/error-toast";
import {
  getMessageSelectionToolbarState,
  getSavedMessageToggleTargets,
  getSelectedMessagesCopiedToastMessage,
  getSelectedMessagesDeleteDescription,
  getSelectedMessagesDeletedToastMessage,
  getSelectedMessagesSaveToastMessage,
  getSelectionActionButtonStates,
} from "./message-selection-toolbar-state";
import { ForwardMessageDialog } from "./unified-message-list/unified-message-item/message-actions-menu";

interface MessageSelectionToolbarProps {
  selectedMessages: UnifiedMessage[];
  onClearSelection: () => void;
}

type ActivityMessageActions = ReturnType<typeof useActivityMessageActions>;

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
  const isOnline = messageActions.isOnline;
  const {
    allSaveableMessagesSaved,
    canDelete,
    canForward,
    saveableMessages,
    saveLabel,
    selectedCount,
  } = getMessageSelectionToolbarState({
    savedMessageIds,
    selectedMessages,
  });
  const actionButtonStates = getSelectionActionButtonStates({
    canDelete,
    canForward,
    isDeleting,
    isOnline,
    isSaving,
    saveLabel,
    saveableCount: saveableMessages.length,
  });

  async function handleCopySelected() {
    const text = getMessagesClipboardContent(selectedMessages);

    if (!(await copyTextToClipboard(text))) {
      showAppErrorMessageToast(
        "We couldn't copy those messages in this browser.",
      );
      return;
    }

    showAppSuccessToast(getSelectedMessagesCopiedToastMessage(selectedCount), {
      id: "selected-messages-copied",
    });
    onClearSelection();
  }

  async function handleToggleSavedSelected() {
    if (saveableMessages.length === 0 || isSaving) {
      return;
    }

    if (showSelectionOfflineToastIfNeeded(isOnline, "save")) {
      return;
    }

    await runSelectionMutation({
      fallbackMessage: "We couldn't update saved messages.",
      run: () =>
        toggleSavedSelectedMessages({
          allSaveableMessagesSaved,
          messageActions,
          savedMessageIds,
          saveableMessages,
        }),
      setIsPending: setIsSaving,
      onSuccess: () => {
        showAppSuccessToast(
          getSelectedMessagesSaveToastMessage(allSaveableMessagesSaved),
          { id: "selected-messages-saved" },
        );
        onClearSelection();
      },
    });
  }

  async function handleDeleteSelected() {
    if (!canDelete || isDeleting) {
      return;
    }

    if (showSelectionOfflineToastIfNeeded(isOnline, "delete")) {
      return;
    }

    await runSelectionMutation({
      fallbackMessage: "We couldn't delete those messages.",
      run: () => deleteSelectedMessages({ messageActions, selectedMessages }),
      setIsPending: setIsDeleting,
      onSuccess: () => {
        showAppSuccessToast(
          getSelectedMessagesDeletedToastMessage(selectedCount),
          { id: "selected-messages-deleted" },
        );
        onClearSelection();
      },
    });
  }

  return (
    <>
      <div className="isolate z-30 min-h-17 shrink-0 overflow-visible border-border/60 border-t bg-canvas/90 px-2.5 pt-2 pb-safe-bottom backdrop-blur-xl sm:px-3">
        <div className="mx-auto flex h-12 w-full max-w-4xl items-center gap-2 sm:gap-2.5">
          <Button
            type="button"
            variant="accentGhost"
            size="icon-sm"
            aria-label="Cancel message selection"
            className="shrink-0 rounded-full"
            onClick={onClearSelection}
          >
            <X className="size-4" aria-hidden="true" />
          </Button>

          <span className="min-w-0 flex-1 truncate font-bold text-ink text-sm">
            {selectedCount} selected
          </span>

          <SelectionToolbarActions
            buttonStates={actionButtonStates}
            onCopy={() => {
              void handleCopySelected();
            }}
            onDelete={() => setDeleteDialogOpen(true)}
            onForward={() => setForwardDialogOpen(true)}
            onSave={() => {
              void handleToggleSavedSelected();
            }}
          />
        </div>
      </div>

      <ActionDialog
        cancelLabel="Keep messages"
        confirmLabel={isDeleting ? "Deleting..." : "Delete messages"}
        description={getSelectedMessagesDeleteDescription(selectedCount)}
        disabled={!isOnline || isDeleting}
        loading={isDeleting}
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
          isOnline={messageActions.isOnline}
          onForwardComplete={onClearSelection}
          onForward={messageActions.forwardMessage}
          onOpenChange={setForwardDialogOpen}
        />
      ) : null}
    </>
  );
}

function SelectionToolbarActions({
  buttonStates,
  onCopy,
  onDelete,
  onForward,
  onSave,
}: {
  buttonStates: ReturnType<typeof getSelectionActionButtonStates>;
  onCopy: () => void;
  onDelete: () => void;
  onForward: () => void;
  onSave: () => void;
}) {
  return (
    <>
      <SelectionActionButton
        icon={Copy}
        label={buttonStates.copy.label}
        onClick={onCopy}
      />
      <SelectionActionButton
        disabled={buttonStates.forward.disabled}
        icon={Forward}
        label={buttonStates.forward.label}
        onClick={onForward}
      />
      <SelectionActionButton
        disabled={buttonStates.save.disabled}
        icon={Bookmark}
        label={buttonStates.save.label}
        onClick={onSave}
        title={buttonStates.save.title}
      />
      <SelectionActionButton
        danger
        disabled={buttonStates.delete.disabled}
        icon={Trash2}
        label={buttonStates.delete.label}
        onClick={onDelete}
        title={buttonStates.delete.title}
      />
    </>
  );
}

async function runSelectionMutation({
  fallbackMessage,
  onSuccess,
  run,
  setIsPending,
}: {
  fallbackMessage: string;
  onSuccess: () => void;
  run: () => Promise<void>;
  setIsPending: (isPending: boolean) => void;
}) {
  setIsPending(true);

  try {
    await run();
    onSuccess();
  } catch (error) {
    showAppErrorToast(error, {
      fallbackMessage,
    });
  } finally {
    setIsPending(false);
  }
}

async function toggleSavedSelectedMessages({
  allSaveableMessagesSaved,
  messageActions,
  savedMessageIds,
  saveableMessages,
}: {
  allSaveableMessagesSaved: boolean;
  messageActions: ActivityMessageActions;
  savedMessageIds: ReadonlySet<string>;
  saveableMessages: UnifiedMessage[];
}) {
  const messagesToToggle = getSavedMessageToggleTargets({
    allSaveableMessagesSaved,
    savedMessageIds,
    saveableMessages,
  });

  await Promise.all(
    messagesToToggle.map((message) =>
      messageActions.toggleSaved(message, allSaveableMessagesSaved),
    ),
  );
}

async function deleteSelectedMessages({
  messageActions,
  selectedMessages,
}: {
  messageActions: ActivityMessageActions;
  selectedMessages: UnifiedMessage[];
}) {
  await Promise.all(
    selectedMessages.map((message) => messageActions.deleteMessage(message)),
  );
}

function showSelectionOfflineToastIfNeeded(
  isOnline: boolean,
  action: "delete" | "save",
) {
  if (isOnline) {
    return false;
  }

  showAppInfoToast("You're offline.", {
    id:
      action === "save"
        ? "selected-messages-save-offline"
        : "selected-messages-delete-offline",
    description:
      action === "save"
        ? "Reconnect before updating saved messages."
        : "Reconnect before deleting messages.",
  });

  return true;
}

function SelectionActionButton({
  danger = false,
  disabled = false,
  icon: Icon,
  label,
  onClick,
  title,
}: {
  danger?: boolean;
  disabled?: boolean;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  title?: string;
}) {
  return (
    <Button
      type="button"
      variant={danger ? "destructive" : "accentGhost"}
      size="xs"
      aria-label={label}
      className="shrink-0 disabled:opacity-45"
      contentClassName="gap-1.5"
      disabled={disabled}
      onClick={onClick}
      title={title}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}
