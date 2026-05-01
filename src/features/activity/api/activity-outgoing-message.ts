import type { AttachmentType, MessageType } from "@/shared/schemas";

import { ActivityApi, type SendMessagePayload } from "./activity.api";
import type { SendActivityMessageInput } from "./activity-action-context";
import type {
  ActivityParticipant,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";

const retryableMessageInputs = new Map<
  string,
  {
    chatId: string;
    input: SendActivityMessageInput;
  }
>();

function inferAttachmentType(file: File): AttachmentType {
  if (file.type.startsWith("image/")) {
    return "IMAGE";
  }

  if (file.type.startsWith("audio/")) {
    return "AUDIO";
  }

  return "FILE";
}

function inferMessageType(
  attachments: SendMessagePayload["attachments"],
): MessageType | undefined {
  const firstAttachment = attachments?.[0];

  if (!firstAttachment) {
    return undefined;
  }

  if (firstAttachment.type === "IMAGE") {
    return "IMAGE";
  }

  if (firstAttachment.type === "AUDIO") {
    return "VOICE";
  }

  return "FILE";
}

function buildOptimisticAttachments(
  attachments: SendActivityMessageInput["attachments"],
) {
  return (
    attachments?.map(({ file, duration }, index) => {
      const type = inferAttachmentType(file);
      const objectUrl = URL.createObjectURL(file);

      return {
        id: `temp-attachment:${file.name}:${file.lastModified}:${index}`,
        type,
        url: objectUrl,
        name: file.name,
        size: file.size,
        mimeType: file.type || null,
        thumbnailUrl: type === "IMAGE" ? objectUrl : null,
        duration: type === "AUDIO" ? (duration ?? null) : null,
        waveform: [],
        createdAt: new Date().toISOString(),
      };
    }) ?? []
  );
}

export function buildOptimisticMessage(
  currentUser: ActivityParticipant,
  chatId: string,
  input: SendActivityMessageInput,
): UnifiedMessage {
  const createdAt = new Date().toISOString();
  const optimisticAttachments = buildOptimisticAttachments(input.attachments);

  return {
    id: `temp-message:${chatId}:${Date.now()}`,
    type:
      optimisticAttachments[0]?.type === "IMAGE"
        ? "IMAGE"
        : optimisticAttachments[0]?.type === "AUDIO"
          ? "VOICE"
          : optimisticAttachments.length > 0
            ? "FILE"
            : "TEXT",
    content: input.content,
    status: "SENDING",
    isEdited: false,
    isPinned: false,
    createdAt,
    updatedAt: createdAt,
    editedAt: null,
    deletedAt: null,
    chatId,
    senderId: currentUser.id,
    replyToId: input.replyTo?.id ?? input.replyToId ?? null,
    version: Date.now(),
    sender: currentUser,
    replyTo: input.replyTo ?? undefined,
    reactions: [],
    attachments: optimisticAttachments,
    isOwn: true,
    isSystem: false,
  };
}

export async function buildSendMessagePayload(
  input: SendActivityMessageInput,
): Promise<SendMessagePayload> {
  const attachments = input.attachments?.length
    ? await Promise.all(
        input.attachments.map(async ({ file, duration }) => {
          const uploaded = await ActivityApi.uploadChatAttachment(file);
          const attachmentType = inferAttachmentType(file);

          return {
            type: attachmentType,
            url: uploaded.url,
            name: file.name,
            size: file.size,
            mimeType: file.type || undefined,
            thumbnailUrl: attachmentType === "IMAGE" ? uploaded.url : undefined,
            duration:
              attachmentType === "AUDIO" ? (duration ?? undefined) : undefined,
          };
        }),
      )
    : undefined;

  return {
    content: input.content.trim() || undefined,
    replyToId: input.replyTo?.id ?? input.replyToId ?? undefined,
    type: inferMessageType(attachments),
    attachments,
  };
}

export function releaseOptimisticMessageResources(message: UnifiedMessage) {
  for (const attachment of message.attachments ?? []) {
    if (!attachment.id.startsWith("temp-attachment:")) {
      continue;
    }

    if (attachment.url.startsWith("blob:")) {
      URL.revokeObjectURL(attachment.url);
    }

    if (
      attachment.thumbnailUrl &&
      attachment.thumbnailUrl !== attachment.url &&
      attachment.thumbnailUrl.startsWith("blob:")
    ) {
      URL.revokeObjectURL(attachment.thumbnailUrl);
    }
  }
}

export function rememberRetryableMessage(
  messageId: string,
  chatId: string,
  input: SendActivityMessageInput,
) {
  retryableMessageInputs.set(messageId, { chatId, input });
}

export function getRetryableMessageInput(messageId: string) {
  return retryableMessageInputs.get(messageId) ?? null;
}

export function forgetRetryableMessage(messageId: string) {
  retryableMessageInputs.delete(messageId);
}

export function hasRetryableMessage(messageId: string) {
  return retryableMessageInputs.has(messageId);
}
