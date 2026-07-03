import type { ActivityOutgoingAttachment } from "@/features/activity/lib/activity-contract";

export type MessageComposerAttachmentSelectionKind = "any" | "image";

export interface MessageComposerAppendAttachmentOptions {
  selectionKind?: MessageComposerAttachmentSelectionKind;
}

export interface MessageComposerAttachmentState {
  attachmentNotice: string | null;
  pendingAttachments: ActivityOutgoingAttachment[];
}
