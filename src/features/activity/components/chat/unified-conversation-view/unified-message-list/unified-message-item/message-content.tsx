import { memo } from "react";
import { extractFirstUrl } from "@/features/activity/lib/chat-utils";
import { cn } from "@/shared/lib/utils";
import { LinkPreview } from "./link-preview";

interface MessageContentProps {
  content?: string;
  hasReply?: boolean;
  isOwn: boolean;
  reactionGroupsLength: number;
  searchQuery?: string;
}

export const MessageContent = memo(
  ({
    content,
    hasReply = false,
    isOwn,
    reactionGroupsLength,
    searchQuery = "",
  }: MessageContentProps) => {
    if (!content) return null;

    const previewUrl = extractFirstUrl(content);
    const highlightedContent = buildHighlightedContent(content, searchQuery);

    return (
      <div className="relative flex min-w-0 max-w-full flex-col gap-2 px-2 py-1.5">
        {/* Link preview — only rendered when a URL is detected in the content */}
        {previewUrl && <LinkPreview url={previewUrl} isOwn={isOwn} />}

        <p
          className={cn(
            "wrap-anywhere min-w-0 max-w-full whitespace-pre-wrap font-medium text-sm leading-snug",
            content.length < 50 &&
              !hasReply &&
              !content.includes(" ") &&
              reactionGroupsLength === 0 &&
              "pr-18",
          )}
        >
          {highlightedContent}
        </p>
      </div>
    );
  },
);

function buildHighlightedContent(content: string, query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase();

  if (!normalizedQuery) {
    return content;
  }

  const normalizedContent = content.toLocaleLowerCase();
  const fragments = [];
  let cursor = 0;
  let matchIndex = normalizedContent.indexOf(normalizedQuery, cursor);

  while (matchIndex !== -1) {
    if (matchIndex > cursor) {
      fragments.push(content.slice(cursor, matchIndex));
    }

    const matchEnd = matchIndex + normalizedQuery.length;

    fragments.push(
      <mark key={`${matchIndex}-${matchEnd}`} className="message-search-mark">
        {content.slice(matchIndex, matchEnd)}
      </mark>,
    );

    cursor = matchEnd;
    matchIndex = normalizedContent.indexOf(normalizedQuery, cursor);
  }

  if (cursor < content.length) {
    fragments.push(content.slice(cursor));
  }

  return fragments.length > 0 ? fragments : content;
}
