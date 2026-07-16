import { Bookmark, Copy, Flag, Forward, Trash2 } from "lucide-react";
import { SelectionActionButton } from "@/features/activity/components/conversation-workspace/message-selection-toolbar/selection-action-button";
import type { getSelectionActionButtonStates } from "@/features/activity/components/conversation-workspace/message-selection-toolbar-state";

export function SelectionToolbarActions({
  buttonStates,
  onCopy,
  onDelete,
  onForward,
  onReport,
  onSave,
  reportDisabled,
}: {
  buttonStates: ReturnType<typeof getSelectionActionButtonStates>;
  onCopy: () => void;
  onDelete: () => void;
  onForward: () => void;
  onReport: () => void;
  onSave: () => void;
  reportDisabled: boolean;
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
        disabled={reportDisabled}
        icon={Flag}
        label="Report"
        onClick={onReport}
        title={
          reportDisabled
            ? "Select a message from someone else to report."
            : "Report the first selected message from someone else and include up to 20 other selected messages."
        }
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
