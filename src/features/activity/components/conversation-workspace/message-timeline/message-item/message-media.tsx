import type {
  UnifiedAttachment,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";
import { isVisualAttachment } from "@/features/activity/lib/gif-attachments";
import { cn } from "@/shared/lib/utils";
import { DocumentMessage } from "./document-message";
import { MediaGallery } from "./media-gallery";
import { VoiceNote } from "./voice-note";

interface MessageMediaProps {
  attachments: UnifiedMessage["attachments"];
  isOwn: boolean;
  content?: string;
  createdAt: string;
  status: UnifiedMessage["status"];
  isReadByOthers: boolean;
  galleryRounding: string;
  reactionGroupsLength: number;
  replyTo: UnifiedMessage["replyTo"];
}

interface MessageMediaAttachmentGroups {
  audioAttachments: UnifiedAttachment[];
  fileAttachments: UnifiedAttachment[];
  visualAttachments: UnifiedAttachment[];
}

export function MessageMedia({
  attachments,
  isOwn,
  content,
  createdAt,
  status,
  isReadByOthers,
  galleryRounding,
  reactionGroupsLength,
  replyTo,
}: MessageMediaProps) {
  if (!attachments || attachments.length === 0) return null;

  const attachmentGroups = getMessageMediaAttachmentGroups(attachments);

  return (
    <div
      className={cn(
        "flex w-full min-w-0 max-w-full shrink-0 flex-col gap-1 overflow-hidden",
        content ? "mb-1" : "",
      )}
    >
      {/* Voice Notes */}
      <VoiceNoteAttachments
        attachments={attachmentGroups.audioAttachments}
        isOwn={isOwn}
      />

      {/* Documents */}
      <DocumentAttachments
        attachments={attachmentGroups.fileAttachments}
        isOwn={isOwn}
      />

      {/* Visual media / Gallery */}
      <VisualMediaAttachments
        attachments={attachmentGroups.visualAttachments}
        content={content}
        createdAt={createdAt}
        galleryRounding={galleryRounding}
        isOwn={isOwn}
        isReadByOthers={isReadByOthers}
        reactionGroupsLength={reactionGroupsLength}
        replyTo={replyTo}
        status={status}
      />
    </div>
  );
}

function getMessageMediaAttachmentGroups(
  attachments: UnifiedAttachment[],
): MessageMediaAttachmentGroups {
  return {
    audioAttachments: attachments.filter(isAudioAttachment),
    fileAttachments: attachments.filter(isFileAttachment),
    visualAttachments: attachments.filter(isVisualAttachment),
  };
}

function isAudioAttachment(attachment: UnifiedAttachment) {
  return attachment.type === "AUDIO";
}

function isFileAttachment(attachment: UnifiedAttachment) {
  return attachment.type === "FILE";
}

function VoiceNoteAttachments({
  attachments,
  isOwn,
}: {
  attachments: UnifiedAttachment[];
  isOwn: boolean;
}) {
  if (attachments.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1 p-1 px-1.5">
      {attachments.map((voice, index) => (
        <VoiceNote
          key={voice.id}
          url={voice.url}
          duration={voice.duration ?? undefined}
          isOwn={isOwn}
          accessibleLabel={
            attachments.length === 1
              ? "Voice note"
              : `Voice note ${index + 1} of ${attachments.length}`
          }
        />
      ))}
    </div>
  );
}

function DocumentAttachments({
  attachments,
  isOwn,
}: {
  attachments: UnifiedAttachment[];
  isOwn: boolean;
}) {
  if (attachments.length === 0) {
    return null;
  }

  return (
    <div className="flex w-full flex-col gap-1.5 text-left">
      {attachments.map((file) => (
        <DocumentMessage key={file.id} attachment={file} isOwn={isOwn} />
      ))}
    </div>
  );
}

function VisualMediaAttachments({
  attachments,
  content,
  createdAt,
  galleryRounding,
  isOwn,
  isReadByOthers,
  reactionGroupsLength,
  replyTo,
  status,
}: Omit<MessageMediaProps, "attachments"> & {
  attachments: UnifiedAttachment[];
}) {
  if (attachments.length === 0) {
    return null;
  }

  return (
    <MediaGallery
      attachments={attachments}
      isOwn={isOwn}
      rounding={galleryRounding}
      isOnlyContent={!replyTo && !content && reactionGroupsLength === 0}
      timestamp={createdAt}
      status={status}
      isReadByOthers={isReadByOthers}
    />
  );
}
