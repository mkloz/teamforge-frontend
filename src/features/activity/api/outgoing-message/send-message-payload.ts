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
  const uploadedAttachments = input.attachments?.length
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
  const gifAttachment = input.gif
    ? {
        type: "VIDEO" as const,
        url: input.gif.url,
        name: input.gif.title,
        mimeType: "video/mp4",
        thumbnailUrl: input.gif.previewUrl ?? undefined,
      }
    : undefined;
  const attachments = [
    ...(uploadedAttachments ?? []),
    ...(gifAttachment ? [gifAttachment] : []),
  ];

  return {
    content: input.content.trim() || undefined,
    replyToId: input.replyTo?.id ?? input.replyToId ?? undefined,
    type: inferOutgoingMessageType(
      attachments.length ? attachments : undefined,
    ),
    attachments: attachments.length ? attachments : undefined,
  };
}
