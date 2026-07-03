import type { SavedMessageSnapshot } from "@/features/activity/lib/saved-message";
import {
  getSavedMessagesContentViewState,
  type SavedMessageRow,
} from "../saved-messages-conversation-view-state";
import { SavedMessagesResultList } from "./saved-messages-result-list";
import {
  SavedMessagesLoadingState,
  SavedMessagesState,
} from "./saved-messages-states";

interface SavedMessagesContentProps {
  isError: boolean;
  isLoading: boolean;
  isRetrying: boolean;
  rows: SavedMessageRow[];
  savedMessagesCount: number;
  searchQuery: string;
  onOpenMessage: (snapshot: SavedMessageSnapshot) => void;
  onRemoveMessage: (messageId: string) => Promise<void> | void;
  onRetry?: () => Promise<void> | void;
}

export function SavedMessagesContent({
  isError,
  isLoading,
  isRetrying,
  rows,
  savedMessagesCount,
  searchQuery,
  onOpenMessage,
  onRemoveMessage,
  onRetry,
}: SavedMessagesContentProps) {
  const contentState = getSavedMessagesContentViewState({
    isError,
    isLoading,
    isRetrying,
    rowsCount: rows.length,
    savedMessagesCount,
    searchQuery,
  });

  if (contentState.kind === "error") {
    return <SavedMessagesState {...contentState.state} onAction={onRetry} />;
  }

  if (contentState.kind === "loading") {
    return <SavedMessagesLoadingState />;
  }

  if (contentState.kind === "empty") {
    return <SavedMessagesState {...contentState.state} />;
  }

  return (
    <SavedMessagesResultList
      rows={rows}
      onOpenMessage={onOpenMessage}
      onRemoveMessage={onRemoveMessage}
    />
  );
}
