import {
  ActivityApi,
  type SendMessagePayload,
} from "@/features/activity/api/activity.api";
import type { SendActivityMessageInput } from "@/features/activity/api/activity-action-context";
import {
  inferOutgoingAttachmentType,
  inferOutgoingMessageType,
} from "@/features/activity/api/outgoing-message/outgoing-attachment-types";
import type {
  ActivityOutgoingAttachment,
  ActivityOutgoingGifAttachment,
} from "@/features/activity/lib/activity-contract";

type SendMessageAttachment = NonNullable<
  SendMessagePayload["attachments"]
>[number];

async function uploadOutgoingAttachment({
  duration,
  file,
}: ActivityOutgoingAttachment): Promise<SendMessageAttachment> {
  const uploaded = await ActivityApi.uploadChatAttachment(file);
  const attachmentType = inferOutgoingAttachmentType(file);

  return {
    type: attachmentType,
    url: uploaded.url,
    name: file.name,
    size: file.size,
    mimeType: file.type || undefined,
    thumbnailUrl: attachmentType === "IMAGE" ? uploaded.url : undefined,
    duration: attachmentType === "AUDIO" ? (duration ?? undefined) : undefined,
  };
}

function buildGifAttachment({
  previewUrl,
  title,
  url,
}: ActivityOutgoingGifAttachment): SendMessageAttachment {
  return {
    type: "VIDEO",
    url,
    name: title,
    mimeType: "video/mp4",
    thumbnailUrl: previewUrl ?? undefined,
  };
}

async function getUploadedAttachments({
  attachments,
}: SendActivityMessageInput): Promise<SendMessageAttachment[]> {
  return attachments?.length
    ? Promise.all(attachments.map(uploadOutgoingAttachment))
    : [];
}

function getMessageAttachments(
  uploadedAttachments: SendMessageAttachment[],
  gif?: ActivityOutgoingGifAttachment,
) {
  return [...uploadedAttachments, ...(gif ? [buildGifAttachment(gif)] : [])];
}

function getPayloadContent(content: string) {
  return content.trim() || undefined;
}

function getPayloadReplyToId({ replyTo, replyToId }: SendActivityMessageInput) {
  return replyTo?.id ?? replyToId ?? undefined;
}

function getPayloadAttachments(attachments: SendMessageAttachment[]) {
  return attachments.length ? attachments : undefined;
}

export async function buildSendMessagePayload(
  input: SendActivityMessageInput,
): Promise<SendMessagePayload> {
  const uploadedAttachments = await getUploadedAttachments(input);
  const attachments = getMessageAttachments(uploadedAttachments, input.gif);
  const payloadAttachments = getPayloadAttachments(attachments);

  return {
    content: getPayloadContent(input.content),
    replyToId: getPayloadReplyToId(input),
    type: inferOutgoingMessageType(payloadAttachments),
    attachments: payloadAttachments,
  };
}
