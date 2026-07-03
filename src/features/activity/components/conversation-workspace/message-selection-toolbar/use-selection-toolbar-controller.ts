import { useState } from "react";
import {
  deleteSelectedMessages,
  runSelectionMutation,
  showSelectionOfflineToastIfNeeded,
  toggleSavedSelectedMessages,
} from "@/features/activity/components/conversation-workspace/message-selection-toolbar/selection-mutations";
import {
  getMessageSelectionToolbarState,
  getSelectedMessagesCopiedToastMessage,
  getSelectedMessagesDeletedToastMessage,
  getSelectedMessagesSaveToastMessage,
  getSelectionActionButtonStates,
} from "@/features/activity/components/conversation-workspace/message-selection-toolbar-state";
import { useActivityMessageActions } from "@/features/activity/hooks/use-activity-message-actions";
import { useSavedMessageIds } from "@/features/activity/hooks/use-saved-message-ids";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { getMessagesClipboardContent } from "@/features/activity/lib/message-clipboard";
import {
  showAppErrorMessageToast,
  showAppSuccessToast,
} from "@/shared/lib/app-toast";
import { copyTextToClipboard } from "@/shared/lib/browser-capabilities";

interface UseMessageSelectionToolbarControllerInput {
  onClearSelection: () => void;
  selectedMessages: UnifiedMessage[];
}

export function useMessageSelectionToolbarController({
  onClearSelection,
  selectedMessages,
}: UseMessageSelectionToolbarControllerInput) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [forwardDialogOpen, setForwardDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const messageActions = useActivityMessageActions();
  const savedMessageIds = useSavedMessageIds();
  const isOnline = messageActions.isOnline;
  const toolbarState = getMessageSelectionToolbarState({
    savedMessageIds,
    selectedMessages,
  });
  const actionButtonStates = getSelectionActionButtonStates({
    canDelete: toolbarState.canDelete,
    canForward: toolbarState.canForward,
    isDeleting,
    isOnline,
    isSaving,
    saveLabel: toolbarState.saveLabel,
    saveableCount: toolbarState.saveableMessages.length,
  });

  async function handleCopySelected() {
    const text = getMessagesClipboardContent(selectedMessages);

    if (!(await copyTextToClipboard(text))) {
      showAppErrorMessageToast(
        "We couldn't copy those messages in this browser.",
      );
      return;
    }

    showAppSuccessToast(
      getSelectedMessagesCopiedToastMessage(toolbarState.selectedCount),
      {
        id: "selected-messages-copied",
      },
    );
    onClearSelection();
  }

  async function handleToggleSavedSelected() {
    if (toolbarState.saveableMessages.length === 0 || isSaving) {
      return;
    }

    if (showSelectionOfflineToastIfNeeded(isOnline, "save")) {
      return;
    }

    await runSelectionMutation({
      fallbackMessage: "We couldn't update saved messages.",
      run: () =>
        toggleSavedSelectedMessages({
          allSaveableMessagesSaved: toolbarState.allSaveableMessagesSaved,
          messageActions,
          savedMessageIds,
          saveableMessages: toolbarState.saveableMessages,
        }),
      setIsPending: setIsSaving,
      onSuccess: () => {
        showAppSuccessToast(
          getSelectedMessagesSaveToastMessage(
            toolbarState.allSaveableMessagesSaved,
          ),
          { id: "selected-messages-saved" },
        );
        onClearSelection();
      },
    });
  }

  async function handleDeleteSelected() {
    if (!toolbarState.canDelete || isDeleting) {
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
          getSelectedMessagesDeletedToastMessage(toolbarState.selectedCount),
          { id: "selected-messages-deleted" },
        );
        onClearSelection();
      },
    });
  }

  return {
    actionButtonStates,
    copySelected: () => {
      void handleCopySelected();
    },
    deleteDialogOpen,
    deleteSelected: handleDeleteSelected,
    forwardDialogOpen,
    isDeleting,
    isOnline,
    messageActions,
    openDeleteDialog: () => setDeleteDialogOpen(true),
    openForwardDialog: () => setForwardDialogOpen(true),
    selectedCount: toolbarState.selectedCount,
    setDeleteDialogOpen,
    setForwardDialogOpen,
    toggleSavedSelected: () => {
      void handleToggleSavedSelected();
    },
  };
}
