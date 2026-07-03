export type MessageListFeedbackState =
  | "empty"
  | "error"
  | "loading"
  | "messages";

export function getMessageListFeedbackState({
  isEmpty,
  isInitialError,
  isInitialLoading,
}: {
  isEmpty: boolean;
  isInitialError: boolean;
  isInitialLoading: boolean;
}): MessageListFeedbackState {
  if (!isEmpty) {
    return "messages";
  }

  if (isInitialLoading) {
    return "loading";
  }

  return isInitialError ? "error" : "empty";
}

export function getViewportTotalHeight({
  isEmpty,
  totalHeight,
}: {
  isEmpty: boolean;
  totalHeight: number;
}) {
  return isEmpty ? 0 : totalHeight;
}
