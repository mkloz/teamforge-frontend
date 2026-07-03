import type { SavedMessageSnapshot } from "@/features/activity/lib/saved-message";

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

export interface SavedMessagesContentViewStateInput {
  isError: boolean;
  isLoading: boolean;
  isRetrying: boolean;
  rowsCount: number;
  savedMessagesCount: number;
  searchQuery: string;
}

export interface SavedMessagesContentStateDecision {
  matches: (input: SavedMessagesContentViewStateInput) => boolean;
  resolve: (
    input: SavedMessagesContentViewStateInput,
  ) => SavedMessagesContentViewState;
}

export interface SavedMessageBubbleSizeInput {
  content: string;
  hasContextPreview: boolean;
  hasVisualAttachments: boolean;
  visualAttachmentCount: number;
}

export interface SavedMessageBubbleSizeDecision {
  matches: (input: SavedMessageBubbleSizeInput) => boolean;
  resolve: (input: SavedMessageBubbleSizeInput) => string;
}
