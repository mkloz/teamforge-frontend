import type { SendMessagePayload } from "@/features/activity/api/activity.api";
import type { AttachmentType, MessageType } from "@/shared/schemas";

export function inferOutgoingAttachmentType(file: File): AttachmentType {
  if (file.type.startsWith("image/")) {
    return "IMAGE";
  }

  if (file.type.startsWith("audio/")) {
    return "AUDIO";
  }

  return "FILE";
}

export function inferOutgoingMessageType(
  attachments: SendMessagePayload["attachments"],
): MessageType | undefined {
  const firstAttachment = attachments?.[0];

  if (!firstAttachment) {
    return undefined;
  }

  if (firstAttachment.type === "IMAGE" || firstAttachment.type === "VIDEO") {
    return "IMAGE";
  }

  if (firstAttachment.type === "AUDIO") {
    return "VOICE";
  }

  return "FILE";
}
