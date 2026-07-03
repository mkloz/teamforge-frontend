import { SelectionToolbarDialogs } from "@/features/activity/components/conversation-workspace/message-selection-toolbar/selection-toolbar-dialogs";
import { SelectionToolbarShell } from "@/features/activity/components/conversation-workspace/message-selection-toolbar/selection-toolbar-shell";
import { useMessageSelectionToolbarController } from "@/features/activity/components/conversation-workspace/message-selection-toolbar/use-selection-toolbar-controller";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";

interface MessageSelectionToolbarProps {
  selectedMessages: UnifiedMessage[];
  onClearSelection: () => void;
}

export function MessageSelectionToolbar({
  selectedMessages,
  onClearSelection,
}: MessageSelectionToolbarProps) {
  const toolbar = useMessageSelectionToolbarController({
    onClearSelection,
    selectedMessages,
  });

  return (
    <>
      <SelectionToolbarShell
        actionButtonStates={toolbar.actionButtonStates}
        onClearSelection={onClearSelection}
        onCopy={toolbar.copySelected}
        onDelete={toolbar.openDeleteDialog}
        onForward={toolbar.openForwardDialog}
        onSave={toolbar.toggleSavedSelected}
        selectedCount={toolbar.selectedCount}
      />

      <SelectionToolbarDialogs
        deleteDialogOpen={toolbar.deleteDialogOpen}
        forwardDialogOpen={toolbar.forwardDialogOpen}
        isDeleting={toolbar.isDeleting}
        isOnline={toolbar.isOnline}
        messageActions={toolbar.messageActions}
        onClearSelection={onClearSelection}
        onConfirmDelete={toolbar.deleteSelected}
        selectedCount={toolbar.selectedCount}
        selectedMessages={selectedMessages}
        setDeleteDialogOpen={toolbar.setDeleteDialogOpen}
        setForwardDialogOpen={toolbar.setForwardDialogOpen}
      />
    </>
  );
}
