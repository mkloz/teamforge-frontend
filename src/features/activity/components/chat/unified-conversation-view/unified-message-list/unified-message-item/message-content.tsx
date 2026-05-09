import { memo } from "react";
import { extractFirstUrl } from "@/features/activity/lib/chat-utils";
import { cn } from "@/shared/lib/utils";
import { LinkPreview } from "./link-preview";

interface MessageContentProps {
  content?: string;
  isOwn: boolean;
  reactionGroupsLength: number;
}

export const MessageContent = memo(
  ({ content, isOwn, reactionGroupsLength }: MessageContentProps) => {
    if (!content) return null;

    const previewUrl = extractFirstUrl(content);

    return (
      <div className="relative flex min-w-0 flex-col gap-2 px-2 py-1.5">
        {/* Link preview — only rendered when a URL is detected in the content */}
        {previewUrl && <LinkPreview url={previewUrl} isOwn={isOwn} />}

        <p
          className={cn(
            "wrap-break-word whitespace-pre-wrap font-medium text-sm leading-snug tracking-tight",
            content.length < 50 &&
              !content.includes(" ") &&
              reactionGroupsLength === 0 &&
              "pr-18",
          )}
        >
          {content}
        </p>
      </div>
    );
  },
);
