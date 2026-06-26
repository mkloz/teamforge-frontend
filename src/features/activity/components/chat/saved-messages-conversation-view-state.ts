import type { UnifiedConversation } from "@/features/activity/lib/activity-contract";
import { getActivityConversationKey } from "@/features/activity/lib/activity-conversation-key";
import { isVisualAttachment } from "@/features/activity/lib/gif-attachments";
import type { SavedMessageSnapshot } from "@/features/activity/lib/saved-message";
import { SAVED_MESSAGES_SUBTITLE } from "@/features/activity/lib/saved-messages-identity";
import {
  getConversationTitle,
  getMessagePreviewText,
} from "@/features/activity/lib/unify-conversations";
import { cn } from "@/shared/lib/utils";

export interface SavedMessageRow {
  conversationTitle: string;
  snapshot: SavedMessageSnapshot;
}

export interface SavedMessageBubbleViewState {
  displayContent: string;
  hasContextPreview: boolean;
  hasVisualAttachments: boolean;
  isOwn: boolean;
  savedAt: SavedMessageSnapshot["savedAt"];
  senderName: string;
  visualAttachmentCount: number;
}

export interface SavedMessageForwardedIndicatorViewState {
  className: string;
  label: string;
  tone: "neutral" | "teal";
}

export interface SavedMessagesStateViewState {
  actionDisabled?: boolean;
  actionLabel?: string;
  description: string;
  icon: "retry" | "saved" | "search";
  title: string;
}

export type SavedMessagesContentViewState =
  | { kind: "empty"; state: SavedMessagesStateViewState }
  | { kind: "error"; state: SavedMessagesStateViewState }
  | { kind: "loading" }
  | { kind: "results" };

interface SavedMessagesContentViewStateInput {
  isError: boolean;
  isLoading: boolean;
  isRetrying: boolean;
  rowsCount: number;
  savedMessagesCount: number;
  searchQuery: string;
}

interface SavedMessagesContentStateDecision {
  matches: (input: SavedMessagesContentViewStateInput) => boolean;
  resolve: (
    input: SavedMessagesContentViewStateInput,
  ) => SavedMessagesContentViewState;
}

interface SavedMessageBubbleSizeInput {
  content: string;
  hasContextPreview: boolean;
  hasVisualAttachments: boolean;
  visualAttachmentCount: number;
}

interface SavedMessageBubbleSizeDecision {
  matches: (input: SavedMessageBubbleSizeInput) => boolean;
  resolve: (input: SavedMessageBubbleSizeInput) => string;
}

const FIT_BUBBLE_SIZE_CLASS = "w-fit max-w-full";
const ATTACHMENT_GRID_BUBBLE_SIZE_CLASS = "w-72 max-w-full sm:w-96";
const CONTEXT_PREVIEW_BUBBLE_SIZE_CLASS =
  "w-fit min-w-72 max-w-full sm:max-w-xl md:max-w-2xl";
const LONG_CONTENT_BUBBLE_SIZE_CLASS =
  "w-fit max-w-full sm:max-w-xl md:max-w-2xl";
const FORWARDED_INDICATOR_BASE_CLASS_NAME =
  "mx-1.5 mt-1 mb-0.5 min-w-0 shrink rounded-lg px-1.5";
const FORWARDED_INDICATOR_RECEIVED_CLASS_NAME = "bg-muted/55 text-slate-muted";

const SAVED_MESSAGES_CONTENT_STATE_DECISIONS: SavedMessagesContentStateDecision[] =
  [
    {
      matches: shouldShowSavedMessagesError,
      resolve: getSavedMessagesErrorContentState,
    },
    {
      matches: shouldShowSavedMessagesLoading,
      resolve: getSavedMessagesLoadingContentState,
    },
    {
      matches: shouldShowSavedMessagesEmpty,
      resolve: getSavedMessagesEmptyContentState,
    },
  ];

const SAVED_MESSAGE_BUBBLE_SIZE_DECISIONS: SavedMessageBubbleSizeDecision[] = [
  {
    matches: shouldUseAttachmentOnlyBubbleSize,
    resolve: getAttachmentOnlyBubbleSizeClass,
  },
  {
    matches: shouldUseContextPreviewBubbleSize,
    resolve: () => CONTEXT_PREVIEW_BUBBLE_SIZE_CLASS,
  },
  {
    matches: shouldUseLongContentBubbleSize,
    resolve: () => LONG_CONTENT_BUBBLE_SIZE_CLASS,
  },
];

export function getSavedMessagesSubtitle(savedMessagesCount: number) {
  if (savedMessagesCount === 0) {
    return SAVED_MESSAGES_SUBTITLE;
  }

  return `${savedMessagesCount} private bookmark${
    savedMessagesCount === 1 ? "" : "s"
  }`;
}

export function getSavedMessagesContentViewState(
  input: SavedMessagesContentViewStateInput,
): SavedMessagesContentViewState {
  const decision = SAVED_MESSAGES_CONTENT_STATE_DECISIONS.find((candidate) =>
    candidate.matches(input),
  );

  return decision?.resolve(input) ?? { kind: "results" };
}

export function getSavedMessageRows(
  savedMessages: SavedMessageSnapshot[],
  conversations: UnifiedConversation[],
  searchQuery: string,
) {
  const conversationsByKey = getConversationsByKey(conversations);
  const normalizedQuery = normalizeSavedMessagesSearchQuery(searchQuery);

  return savedMessages
    .map((snapshot) => getSavedMessageRow(snapshot, conversationsByKey))
    .filter((row) => shouldShowSavedMessageRow(row, normalizedQuery));
}

export function getSavedMessageBubbleViewState(
  row: SavedMessageRow,
): SavedMessageBubbleViewState {
  const { message, savedAt } = row.snapshot;
  const attachments = message.attachments ?? [];
  const visualAttachmentCount = getVisualAttachmentCount(attachments);

  return {
    displayContent: getSavedMessageDisplayContent(row.snapshot),
    hasContextPreview: hasSavedMessageContextPreview(row.snapshot),
    hasVisualAttachments: visualAttachmentCount > 0,
    isOwn: message.isOwn,
    savedAt,
    senderName: message.sender?.name ?? "Unknown sender",
    visualAttachmentCount,
  };
}

export function shouldUseSavedMessageInlineFooter(input: {
  displayContent: string;
  hasReply: boolean;
  reactionGroupsLength: number;
}) {
  return (
    hasInlineFooterContent(input.displayContent) &&
    !input.hasReply &&
    isCompactSingleToken(input.displayContent) &&
    input.reactionGroupsLength === 0
  );
}

export function getSavedMessageForwardedIndicatorViewState({
  isOwn,
  message,
}: {
  isOwn: boolean;
  message: SavedMessageSnapshot["message"];
}): SavedMessageForwardedIndicatorViewState | null {
  if (!isForwardedSavedMessage(message)) {
    return null;
  }

  return {
    className: getSavedMessageForwardedIndicatorClassName(isOwn),
    label: getSavedMessageForwardedIndicatorLabel(message),
    tone: getSavedMessageForwardedIndicatorTone(isOwn),
  };
}

function isForwardedSavedMessage(message: SavedMessageSnapshot["message"]) {
  return Boolean(message.forwardedFromMessageId);
}

function getSavedMessageForwardedIndicatorClassName(isOwn: boolean) {
  return cn(
    FORWARDED_INDICATOR_BASE_CLASS_NAME,
    !isOwn && FORWARDED_INDICATOR_RECEIVED_CLASS_NAME,
  );
}

function getSavedMessageForwardedIndicatorLabel(
  message: SavedMessageSnapshot["message"],
) {
  const sourceName = message.forwardedFromSenderName?.trim();

  return sourceName ? `Forwarded from ${sourceName}` : "Forwarded";
}

function getSavedMessageForwardedIndicatorTone(
  isOwn: boolean,
): SavedMessageForwardedIndicatorViewState["tone"] {
  return isOwn ? "teal" : "neutral";
}

export function isSavedMessageOpenKey(key: string) {
  return key === "Enter" || key === " ";
}

export function getSavedMessageBubbleSizeClass({
  content,
  hasContextPreview,
  hasVisualAttachments,
  visualAttachmentCount,
}: SavedMessageBubbleSizeInput) {
  const input = {
    content,
    hasContextPreview,
    hasVisualAttachments,
    visualAttachmentCount,
  };
  const decision = SAVED_MESSAGE_BUBBLE_SIZE_DECISIONS.find((candidate) =>
    candidate.matches(input),
  );

  return decision?.resolve(input) ?? FIT_BUBBLE_SIZE_CLASS;
}

export function getSavedMessageGalleryRounding(rounding: string) {
  const nextRounding = rounding
    .split(" ")
    .filter(
      (className) =>
        !["rounded-br-none", "rounded-bl-none"].includes(className),
    )
    .join(" ");

  return cn(nextRounding, "rounded-tl-none");
}

function getSavedMessagesEmptyState(
  searchQuery: string,
): SavedMessagesStateViewState {
  const hasSearchQuery = Boolean(searchQuery.trim());

  return {
    icon: hasSearchQuery ? "search" : "saved",
    title: hasSearchQuery ? "No saved messages found" : "No saved messages yet",
    description: hasSearchQuery
      ? "Try a sender, chat name, or a phrase from the message."
      : "Use Save message from any message menu. This chat stays separate from My notes.",
  };
}

function shouldShowSavedMessagesError(
  input: SavedMessagesContentViewStateInput,
) {
  return input.isError && hasNoSavedMessages(input);
}

function shouldShowSavedMessagesLoading(
  input: SavedMessagesContentViewStateInput,
) {
  return input.isLoading && hasNoSavedMessages(input);
}

function shouldShowSavedMessagesEmpty(
  input: SavedMessagesContentViewStateInput,
) {
  return input.rowsCount === 0;
}

function hasNoSavedMessages(input: SavedMessagesContentViewStateInput) {
  return input.savedMessagesCount === 0;
}

function getSavedMessagesErrorContentState(
  input: SavedMessagesContentViewStateInput,
): SavedMessagesContentViewState {
  return {
    kind: "error",
    state: {
      icon: "retry",
      title: "Saved messages did not load",
      description: "Retry to bring your private bookmarks back.",
      actionLabel: input.isRetrying ? "Retrying..." : "Retry",
      actionDisabled: input.isRetrying,
    },
  };
}

function getSavedMessagesLoadingContentState(): SavedMessagesContentViewState {
  return { kind: "loading" };
}

function getSavedMessagesEmptyContentState(
  input: SavedMessagesContentViewStateInput,
): SavedMessagesContentViewState {
  return {
    kind: "empty",
    state: getSavedMessagesEmptyState(input.searchQuery),
  };
}

function getConversationsByKey(conversations: UnifiedConversation[]) {
  return new Map(
    conversations.map((conversation) => [
      getActivityConversationKey(conversation.kind, conversation.id),
      conversation,
    ]),
  );
}

function normalizeSavedMessagesSearchQuery(searchQuery: string) {
  return searchQuery.trim().toLowerCase();
}

function getSavedMessageRow(
  snapshot: SavedMessageSnapshot,
  conversationsByKey: Map<string, UnifiedConversation>,
): SavedMessageRow {
  const conversation = conversationsByKey.get(
    getActivityConversationKey(
      snapshot.conversationKind,
      snapshot.conversationId,
    ),
  );

  return {
    conversationTitle: conversation
      ? getConversationTitle(conversation)
      : "Original chat unavailable",
    snapshot,
  };
}

function shouldShowSavedMessageRow(
  row: SavedMessageRow,
  normalizedQuery: string,
) {
  if (!normalizedQuery) {
    return true;
  }

  return getSavedMessageSearchText(row).includes(normalizedQuery);
}

function getSavedMessageSearchText(row: SavedMessageRow) {
  return [
    row.conversationTitle,
    row.snapshot.message.sender?.name ?? "",
    getMessagePreviewText(row.snapshot.message),
  ]
    .join(" ")
    .toLowerCase();
}

function getSavedMessageDisplayContent(snapshot: SavedMessageSnapshot) {
  const { message } = snapshot;

  if (message.content) {
    return message.content;
  }

  if ((message.attachments ?? []).length > 0) {
    return "";
  }

  return getMessagePreviewText(message);
}

function hasSavedMessageContextPreview(snapshot: SavedMessageSnapshot) {
  return Boolean(
    snapshot.message.replyTo || snapshot.message.forwardedFromMessageId,
  );
}

function getVisualAttachmentCount(
  attachments: SavedMessageSnapshot["message"]["attachments"],
) {
  return (attachments ?? []).filter(isVisualAttachment).length;
}

function hasInlineFooterContent(content: string) {
  return content.trim().length > 0;
}

function isCompactSingleToken(content: string) {
  return content.length < 50 && !content.includes(" ");
}

function shouldUseAttachmentOnlyBubbleSize(input: SavedMessageBubbleSizeInput) {
  return (
    input.hasVisualAttachments && !input.content && !input.hasContextPreview
  );
}

function getAttachmentOnlyBubbleSizeClass(input: SavedMessageBubbleSizeInput) {
  return input.visualAttachmentCount > 1
    ? ATTACHMENT_GRID_BUBBLE_SIZE_CLASS
    : FIT_BUBBLE_SIZE_CLASS;
}

function shouldUseContextPreviewBubbleSize(input: SavedMessageBubbleSizeInput) {
  return input.hasContextPreview;
}

function shouldUseLongContentBubbleSize(input: SavedMessageBubbleSizeInput) {
  return input.content.length > 80;
}
