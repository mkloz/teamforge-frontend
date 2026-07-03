const UNREAD_SEPARATOR_DISMISS_BOTTOM_THRESHOLD_PX = 24;

export interface DismissedUnreadSeparator {
  conversationId: string;
  messageId: string;
}

export function getVisibleUnreadMessageId({
  conversationId,
  dismissedUnreadSeparator,
  firstUnreadMessageId,
}: {
  conversationId: string;
  dismissedUnreadSeparator: DismissedUnreadSeparator | null;
  firstUnreadMessageId: string | null;
}) {
  return isUnreadSeparatorDismissed({
    conversationId,
    dismissedUnreadSeparator,
    firstUnreadMessageId,
  })
    ? null
    : firstUnreadMessageId;
}

export function shouldDismissUnreadSeparator({
  conversationId,
  dismissedUnreadSeparator,
  distanceFromBottom,
  firstUnreadMessageId,
}: {
  conversationId: string;
  dismissedUnreadSeparator: DismissedUnreadSeparator | null;
  distanceFromBottom: number;
  firstUnreadMessageId: string | null;
}) {
  return Boolean(
    firstUnreadMessageId &&
      !isUnreadSeparatorDismissed({
        conversationId,
        dismissedUnreadSeparator,
        firstUnreadMessageId,
      }) &&
      distanceFromBottom <= UNREAD_SEPARATOR_DISMISS_BOTTOM_THRESHOLD_PX,
  );
}

function isUnreadSeparatorDismissed({
  conversationId,
  dismissedUnreadSeparator,
  firstUnreadMessageId,
}: {
  conversationId: string;
  dismissedUnreadSeparator: DismissedUnreadSeparator | null;
  firstUnreadMessageId: string | null;
}) {
  return Boolean(
    firstUnreadMessageId &&
      dismissedUnreadSeparator?.conversationId === conversationId &&
      dismissedUnreadSeparator.messageId === firstUnreadMessageId,
  );
}
