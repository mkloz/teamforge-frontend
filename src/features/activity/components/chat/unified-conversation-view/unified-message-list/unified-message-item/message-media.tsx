import { cn } from "@/shared/lib/utils";
import { memo } from "react";
import type {
  UnifiedMessage,
  UnifiedAttachment,
} from "@/features/activity/lib/activity-contract";
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

export const MessageMedia = memo(
  ({
    attachments,
    isOwn,
    content,
    createdAt,
    status,
    isReadByOthers,
    galleryRounding,
    reactionGroupsLength,
    replyTo,
  }: MessageMediaProps) => {
    if (!attachments || attachments.length === 0) return null;

    return (
      <div
        className={cn(
          "w-full overflow-hidden shrink-0 flex flex-col gap-1",
          content ? "mb-1" : "",
        )}
      >
        {/* Voice Notes */}
        {attachments.some((a: UnifiedAttachment) => a.type === "AUDIO") && (
          <div className="p-1 px-1.5 flex flex-col gap-1">
            {attachments
              .filter((a: UnifiedAttachment) => a.type === "AUDIO")
              .map((voice: UnifiedAttachment) => (
                <VoiceNote
                  key={voice.id}
                  url={voice.url}
                  duration={voice.duration ?? undefined}
                  isOwn={isOwn}
                />
              ))}
          </div>
        )}

        {/* Documents */}
        {attachments.some((a: UnifiedAttachment) => a.type === "FILE") && (
          <div className="flex flex-col gap-1.5 w-full text-left">
            {attachments
              .filter((a: UnifiedAttachment) => a.type === "FILE")
              .map((file: UnifiedAttachment) => (
                <DocumentMessage
                  key={file.id}
                  attachment={file}
                  isOwn={isOwn}
                />
              ))}
          </div>
        )}

        {/* Visual media / Gallery */}
        {attachments.some(
          (a: UnifiedAttachment) => a.type === "IMAGE" || a.type === "VIDEO",
        ) && (
          <MediaGallery
            attachments={attachments.filter(
              (a: UnifiedAttachment) =>
                a.type === "IMAGE" || a.type === "VIDEO",
            )}
            isOwn={isOwn}
            rounding={galleryRounding}
            isOnlyContent={!replyTo && !content && reactionGroupsLength === 0}
            timestamp={createdAt}
            status={status}
            isReadByOthers={isReadByOthers}
          />
        )}
      </div>
    );
  },
);
