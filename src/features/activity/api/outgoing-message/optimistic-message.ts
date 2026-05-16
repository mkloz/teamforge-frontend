import type { SendActivityMessageInput } from "@/features/activity/api/activity-action-context";
import { inferOutgoingAttachmentType } from "@/features/activity/api/outgoing-message/outgoing-attachment-types";
import type {
  ActivityParticipant,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";

function buildOptimisticAttachments(
  attachments: SendActivityMessageInput["attachments"],
  gif: SendActivityMessageInput["gif"],
) {
  const fileAttachments =
    attachments?.map(({ file, duration }, index) => {
      const type = inferOutgoingAttachmentType(file);
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
    }) ?? [];

  if (!gif) {
    return fileAttachments;
  }

  return [
    ...fileAttachments,
    {
      id: `temp-gif:${gif.provider}:${gif.providerId}:${Date.now()}`,
      type: "VIDEO" as const,
      url: gif.url,
      name: gif.title,
      size: null,
      mimeType: "video/mp4",
      thumbnailUrl: gif.previewUrl ?? null,
      duration: null,
      waveform: [],
      createdAt: new Date().toISOString(),
    },
  ];
}

export function buildOptimisticMessage(
  currentUser: ActivityParticipant,
  chatId: string,
  input: SendActivityMessageInput,
): UnifiedMessage {
  const createdAt = new Date().toISOString();
  const optimisticAttachments = buildOptimisticAttachments(
    input.attachments,
    input.gif,
  );

  return {
    id: `temp-message:${chatId}:${Date.now()}`,
    type:
      optimisticAttachments[0]?.type === "IMAGE"
        ? "IMAGE"
        : optimisticAttachments[0]?.type === "VIDEO"
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
