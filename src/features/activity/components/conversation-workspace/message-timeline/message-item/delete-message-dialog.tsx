import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { ActionDialog } from "@/shared/components/ui/action-dialog";

interface DeleteMessageDialogProps {
  message: UnifiedMessage;
  onDelete: (message: UnifiedMessage) => Promise<void> | void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function DeleteMessageDialog({
  message,
  onDelete,
  onOpenChange,
  open,
}: DeleteMessageDialogProps) {
  return (
    <ActionDialog
      cancelLabel="Keep message"
      confirmLabel="Delete message"
      description="This removes the message from the conversation. Replies and pinned references to it may no longer make sense."
      details={
        message.attachments?.length
          ? ["Attached files will no longer appear with this message."]
          : undefined
      }
      onConfirm={() => onDelete(message)}
      open={open}
      onOpenChange={onOpenChange}
      title="Delete this message?"
      tone="danger"
    />
  );
}
