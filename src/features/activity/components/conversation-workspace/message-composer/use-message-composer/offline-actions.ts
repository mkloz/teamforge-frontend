import type { MessageComposerAppendAttachmentOptions } from "@/features/activity/components/conversation-workspace/message-composer/use-message-composer-attachments";
import {
  OFFLINE_MESSAGE_DESCRIPTION,
  OFFLINE_UPLOAD_DESCRIPTION,
} from "./constants";
import type { OfflineActionGuard } from "./types";

export function guardComposerMessageOffline(
  guardOfflineAction: OfflineActionGuard,
  options: { id?: string } = {},
) {
  return guardOfflineAction({
    id: options.id ?? "chat-message-offline",
    description: OFFLINE_MESSAGE_DESCRIPTION,
  });
}

export function appendComposerAttachments({
  appendAttachments,
  files,
  guardOfflineAction,
  options,
}: {
  appendAttachments: (
    files: File[],
    options?: MessageComposerAppendAttachmentOptions,
  ) => void;
  files: File[];
  guardOfflineAction: OfflineActionGuard;
  options?: MessageComposerAppendAttachmentOptions;
}) {
  if (files.length === 0) {
    return;
  }

  if (
    guardOfflineAction({
      id: "chat-attachments-offline",
      description: OFFLINE_UPLOAD_DESCRIPTION,
    })
  ) {
    return;
  }

  appendAttachments(files, options);
}
