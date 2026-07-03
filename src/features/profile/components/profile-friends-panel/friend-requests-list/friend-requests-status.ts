export type FriendRequestsStatus = "loading" | "error" | "empty" | "ready";

export function getFriendRequestsStatus({
  hasPendingRequests,
  isError,
  isLoading,
}: {
  hasPendingRequests: boolean;
  isError: boolean;
  isLoading: boolean;
}): FriendRequestsStatus {
  if (isLoading) {
    return "loading";
  }

  if (isError) {
    return "error";
  }

  if (!hasPendingRequests) {
    return "empty";
  }

  return "ready";
}

export function hasFriendRequestsLoading({
  isIncomingLoading,
  isOutgoingLoading,
}: {
  isIncomingLoading: boolean;
  isOutgoingLoading: boolean;
}) {
  return isIncomingLoading || isOutgoingLoading;
}

export function hasFriendRequestsError({
  isIncomingError,
  isOutgoingError,
}: {
  isIncomingError: boolean;
  isOutgoingError: boolean;
}) {
  return isIncomingError || isOutgoingError;
}

export function hasPendingFriendRequests({
  incomingCount,
  outgoingCount,
}: {
  incomingCount: number;
  outgoingCount: number;
}) {
  return incomingCount > 0 || outgoingCount > 0;
}
