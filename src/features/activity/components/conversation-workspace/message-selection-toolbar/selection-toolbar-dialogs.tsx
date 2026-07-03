import type { Dispatch, SetStateAction } from "react";
import type { ActivityMessageActions } from "@/features/activity/components/conversation-workspace/message-selection-toolbar/types";
import { getSelectedMessagesDeleteDescription } from "@/features/activity/components/conversation-workspace/message-selection-toolbar-state";
import { ForwardMessageDialog } from "@/features/activity/components/conversation-workspace/message-timeline/message-item/message-actions-menu";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { ActionDialog } from "@/shared/components/ui/action-dialog";

interface SelectionToolbarDialogsProps {
  deleteDialogOpen: boolean;
  forwardDialogOpen: boolean;
  isDeleting: boolean;
  isOnline: boolean;
  messageActions: ActivityMessageActions;
  onClearSelection: () => void;
  onConfirmDelete: () => Promise<void>;
  selectedCount: number;
  selectedMessages: UnifiedMessage[];
  setDeleteDialogOpen: Dispatch<SetStateAction<boolean>>;
  setForwardDialogOpen: Dispatch<SetStateAction<boolean>>;
}

export function SelectionToolbarDialogs({
  deleteDialogOpen,
  forwardDialogOpen,
  isDeleting,
  isOnline,
  messageActions,
  onClearSelection,
  onConfirmDelete,
  selectedCount,
  selectedMessages,
  setDeleteDialogOpen,
  setForwardDialogOpen,
}: SelectionToolbarDialogsProps) {
  return (
    <>
      <ActionDialog
        cancelLabel="Keep messages"
        confirmLabel={isDeleting ? "Deleting..." : "Delete messages"}
        description={getSelectedMessagesDeleteDescription(selectedCount)}
        disabled={!isOnline || isDeleting}
        loading={isDeleting}
        onConfirm={onConfirmDelete}
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
