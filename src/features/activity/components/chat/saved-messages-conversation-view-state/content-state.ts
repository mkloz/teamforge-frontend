import type {
  SavedMessagesContentStateDecision,
  SavedMessagesContentViewState,
  SavedMessagesContentViewStateInput,
  SavedMessagesStateViewState,
} from "./types";

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

export function getSavedMessagesContentViewState(
  input: SavedMessagesContentViewStateInput,
): SavedMessagesContentViewState {
  const decision = SAVED_MESSAGES_CONTENT_STATE_DECISIONS.find((candidate) =>
    candidate.matches(input),
  );

  return decision?.resolve(input) ?? { kind: "results" };
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
