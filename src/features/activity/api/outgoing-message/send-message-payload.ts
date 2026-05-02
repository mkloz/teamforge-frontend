import {
  ActivityApi,
  type SendMessagePayload,
} from "@/features/activity/api/activity.api";
import type { SendActivityMessageInput } from "@/features/activity/api/activity-action-context";
import {
  inferOutgoingAttachmentType,
  inferOutgoingMessageType,
} from "@/features/activity/api/outgoing-message/outgoing-attachment-types";

export async function buildSendMessagePayload(
  input: SendActivityMessageInput,
): Promise<SendMessagePayload> {
  const attachments = input.attachments?.length
    ? await Promise.all(
        input.attachments.map(async ({ file, duration }) => {
          const uploaded = await ActivityApi.uploadChatAttachment(file);
          const attachmentType = inferOutgoingAttachmentType(file);

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
    type: inferOutgoingMessageType(attachments),
    attachments,
  };
}
