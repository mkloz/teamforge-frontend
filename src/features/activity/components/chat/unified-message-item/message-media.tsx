import { cn } from "@/shared/lib/utils";
import { memo } from "react";
import type { UnifiedMessage } from "../../types/chat.types";
import { DocumentMessage } from "../document-message";
import { MediaGallery } from "../media-gallery";
import { VoiceNote } from "../voice-note";

interface MessageMediaProps {
  attachments: UnifiedMessage["attachments"];
  isOwn: boolean;
  content?: string;
  timestamp: string;
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
    timestamp,
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
        {attachments.some((a) => a.type === "voice") && (
          <div className="p-1 px-1.5 flex flex-col gap-1">
            {attachments
              .filter((a) => a.type === "voice")
              .map((voice) => (
                <VoiceNote
                  key={voice.id}
                  url={voice.url}
                  duration={voice.duration}
                  isOwn={isOwn}
                />
              ))}
          </div>
        )}

        {/* Documents */}
        {attachments.some((a) => a.type === "file") && (
          <div className="flex flex-col gap-1.5 w-full text-left">
            {attachments
              .filter((a) => a.type === "file")
              .map((file) => (
                <DocumentMessage
                  key={file.id}
                  attachment={file}
                  isOwn={isOwn}
                />
              ))}
          </div>
        )}

        {/* Images / Gallery */}
        {attachments.some((a) => a.type === "image") && (
          <MediaGallery
            attachments={attachments.filter((a) => a.type === "image")}
            isOwn={isOwn}
            rounding={galleryRounding}
            isOnlyContent={!replyTo && !content && reactionGroupsLength === 0}
            timestamp={timestamp}
            status={status}
            isReadByOthers={isReadByOthers}
          />
        )}
      </div>
    );
  },
);
