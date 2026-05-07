import { cn } from "@/shared/lib/utils";
import { memo } from "react";
import { LinkPreview } from "./link-preview";
import { extractFirstUrl } from "@/features/activity/lib/chat-utils";

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
            "text-sm leading-[1.45] font-medium tracking-tight wrap-break-word whitespace-pre-wrap",
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
