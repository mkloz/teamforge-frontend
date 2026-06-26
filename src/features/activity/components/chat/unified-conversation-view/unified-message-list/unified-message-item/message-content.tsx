import { memo, type ReactNode } from "react";
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

type MessageContentViewState =
  | { kind: "empty" }
  | {
      highlightedContent: ReactNode;
      kind: "content";
      paragraphClassName: string;
      previewUrl: string | null;
    };

export const MessageContent = memo(
  ({
    content,
    hasReply = false,
    isOwn,
    reactionGroupsLength,
    searchQuery = "",
  }: MessageContentProps) => {
    const viewState = getMessageContentViewState({
      content,
      hasReply,
      reactionGroupsLength,
      searchQuery,
    });

    if (viewState.kind === "empty") return null;

    return (
      <div className="relative flex min-w-0 max-w-full flex-col gap-2 px-2 py-1.5">
        {/* Link preview — only rendered when a URL is detected in the content */}
        <MessageContentLinkPreview
          previewUrl={viewState.previewUrl}
          isOwn={isOwn}
        />

        <p className={viewState.paragraphClassName}>
          {viewState.highlightedContent}
        </p>
      </div>
    );
  },
);

function getMessageContentViewState({
  content,
  hasReply,
  reactionGroupsLength,
  searchQuery,
}: {
  content?: string;
  hasReply: boolean;
  reactionGroupsLength: number;
  searchQuery: string;
}): MessageContentViewState {
  if (!content) {
    return { kind: "empty" };
  }

  return {
    kind: "content",
    highlightedContent: buildHighlightedContent(content, searchQuery),
    paragraphClassName: getMessageParagraphClassName({
      content,
      hasReply,
      reactionGroupsLength,
    }),
    previewUrl: extractFirstUrl(content),
  };
}

function getMessageParagraphClassName({
  content,
  hasReply,
  reactionGroupsLength,
}: {
  content: string;
  hasReply: boolean;
  reactionGroupsLength: number;
}) {
  return cn(
    "wrap-anywhere min-w-0 max-w-full whitespace-pre-wrap font-medium text-sm leading-snug",
    shouldReserveInlineFooterSpace({
      content,
      hasReply,
      reactionGroupsLength,
    }) && "pr-24",
  );
}

function shouldReserveInlineFooterSpace({
  content,
  hasReply,
  reactionGroupsLength,
}: {
  content: string;
  hasReply: boolean;
  reactionGroupsLength: number;
}) {
  return (
    content.length < 50 &&
    !hasReply &&
    !content.includes(" ") &&
    reactionGroupsLength === 0
  );
}

function MessageContentLinkPreview({
  previewUrl,
  isOwn,
}: {
  previewUrl: string | null;
  isOwn: boolean;
}) {
  if (!previewUrl) {
    return null;
  }

  return <LinkPreview url={previewUrl} isOwn={isOwn} />;
}

function buildHighlightedContent(content: string, query: string) {
  const normalizedQuery = getNormalizedSearchQuery(query);

  if (!normalizedQuery) {
    return content;
  }

  const fragments = buildHighlightedContentFragments(content, normalizedQuery);

  return fragments.length > 0 ? fragments : content;
}

function buildHighlightedContentFragments(
  content: string,
  normalizedQuery: string,
) {
  const normalizedContent = content.toLocaleLowerCase();
  const fragments: ReactNode[] = [];
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

  return fragments;
}

function getNormalizedSearchQuery(query: string) {
  return query.trim().toLocaleLowerCase();
}
