import { useState } from "react";
import { useConversationCapabilities } from "@/features/activity/components/conversation-workspace/conversation-capability-context";
import { SelectionToolbarDialogs } from "@/features/activity/components/conversation-workspace/message-selection-toolbar/selection-toolbar-dialogs";
import { SelectionToolbarShell } from "@/features/activity/components/conversation-workspace/message-selection-toolbar/selection-toolbar-shell";
import { useMessageSelectionToolbarController } from "@/features/activity/components/conversation-workspace/message-selection-toolbar/use-selection-toolbar-controller";
import { getSelectedMessageReportContext } from "@/features/activity/components/conversation-workspace/message-selection-toolbar-state";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import {
  blockReportedUser,
  ReportDialog,
} from "@/features/reporting/public/reporting";

interface MessageSelectionToolbarProps {
  selectedMessages: UnifiedMessage[];
  onClearSelection: () => void;
}

export function MessageSelectionToolbar({
  selectedMessages,
  onClearSelection,
}: MessageSelectionToolbarProps) {
  const capabilities = useConversationCapabilities();
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const toolbar = useMessageSelectionToolbarController({
    canForwardMessages: capabilities.canForwardMessages,
    onClearSelection,
    selectedMessages,
  });
  const reportContext = getSelectedMessageReportContext(selectedMessages);

  return (
    <>
      <SelectionToolbarShell
        actionButtonStates={toolbar.actionButtonStates}
        onClearSelection={onClearSelection}
        onCopy={toolbar.copySelected}
        onDelete={toolbar.openDeleteDialog}
        onForward={toolbar.openForwardDialog}
        onReport={() => setReportDialogOpen(true)}
        onSave={toolbar.toggleSavedSelected}
        reportDisabled={!reportContext}
        selectedCount={toolbar.selectedCount}
      />

      <SelectionToolbarDialogs
        deleteDialogOpen={toolbar.deleteDialogOpen}
        forwardDialogOpen={
          capabilities.canForwardMessages && toolbar.forwardDialogOpen
        }
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

      {reportContext ? (
        <ReportDialog
          canRequestBlock
          onBlock={() =>
            blockReportedUser(
              reportContext.primaryMessage.sender?.id ??
                reportContext.primaryMessage.senderId,
            )
          }
          evidenceSummary={getReportEvidenceSummary(reportContext)}
          open={reportDialogOpen}
          onOpenChange={setReportDialogOpen}
          targets={[
            {
              id: reportContext.primaryMessage.id,
              label: `Message from ${reportContext.primaryMessage.sender?.name ?? "this person"}`,
              relatedMessageIds: reportContext.relatedMessageIds,
              type: "MESSAGE",
            },
          ]}
        />
      ) : null}
    </>
  );
}

function getReportEvidenceSummary(
  context: NonNullable<ReturnType<typeof getSelectedMessageReportContext>>,
) {
  const includedCount = context.relatedMessageIds.length;
  const includedCopy =
    includedCount === 0
      ? "Only the reported message is included from your selection."
      : `The reported message and ${includedCount} additional selected ${includedCount === 1 ? "message is" : "messages are"} included.`;

  if (context.omittedMessageCount === 0) {
    return includedCopy;
  }

  return `${includedCopy} ${context.omittedMessageCount} more selected ${context.omittedMessageCount === 1 ? "message is" : "messages are"} not included.`;
}
