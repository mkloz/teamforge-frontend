import type { SendMessagePayload } from "@/features/activity/api/activity.api";
import type { AttachmentType, MessageType } from "@/shared/schemas";

const OUTGOING_MESSAGE_TYPE_BY_ATTACHMENT_TYPE = {
  AUDIO: "VOICE",
  FILE: "FILE",
  GIF: "IMAGE",
  IMAGE: "IMAGE",
  VIDEO: "IMAGE",
} as const satisfies Record<AttachmentType, MessageType>;

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
  const firstAttachmentType = getFirstOutgoingAttachmentType(attachments);

  if (!firstAttachmentType) {
    return undefined;
  }

  return getOutgoingMessageTypeForAttachmentType(firstAttachmentType);
}

function getFirstOutgoingAttachmentType(
  attachments: SendMessagePayload["attachments"],
) {
  return attachments?.[0]?.type;
}

function getOutgoingMessageTypeForAttachmentType(
  attachmentType: AttachmentType,
): MessageType {
  return OUTGOING_MESSAGE_TYPE_BY_ATTACHMENT_TYPE[attachmentType];
}
