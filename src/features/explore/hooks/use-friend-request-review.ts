import { useEffect, useMemo, useState } from "react";

import { useExploreFriendRequests } from "@/features/explore/hooks/use-explore-friend-requests";
import { useExploreRouteState } from "@/features/explore/hooks/use-explore-route-state";

export function useFriendRequestReview() {
  const {
    requests,
    isLoading,
    acceptRequest,
    declineRequest,
    acceptingRequestId,
    decliningRequestId,
    isAccepting,
    isDeclining,
  } = useExploreFriendRequests();
  const { focusedPanel, focusedRequestId, clearFocusedFriendRequest } =
    useExploreRouteState();
  const [hiddenRequestIds, setHiddenRequestIds] = useState<string[]>([]);

  const visibleRequests = useMemo(
    () =>
      requests.filter(
        (request) => !hiddenRequestIds.includes(request.requesterId),
      ),
    [hiddenRequestIds, requests],
  );
  const shouldRender = focusedPanel === "friends" || visibleRequests.length > 0;

  useEffect(() => {
    if (focusedPanel !== "friends" || !focusedRequestId) {
      return;
    }

    if (
      visibleRequests.some(
        (request) => request.requesterId === focusedRequestId,
      )
    ) {
      return;
    }

    clearFocusedFriendRequest();
  }, [
    clearFocusedFriendRequest,
    focusedPanel,
    focusedRequestId,
    visibleRequests,
  ]);

  const hideRequest = (requesterId: string) => {
    setHiddenRequestIds((current) =>
      current.includes(requesterId) ? current : [...current, requesterId],
    );
  };

  const restoreRequest = (requesterId: string) => {
    setHiddenRequestIds((current) =>
      current.filter((id) => id !== requesterId),
    );
  };

  const acceptVisibleRequest = async (requesterId: string) => {
    hideRequest(requesterId);

    try {
      await acceptRequest(requesterId);
      if (focusedRequestId === requesterId) {
        clearFocusedFriendRequest();
      }
    } catch {
      restoreRequest(requesterId);
    }
  };

  const declineVisibleRequest = async (requesterId: string) => {
    hideRequest(requesterId);

    try {
      await declineRequest(requesterId);
      if (focusedRequestId === requesterId) {
        clearFocusedFriendRequest();
      }
    } catch {
      restoreRequest(requesterId);
    }
  };

  return {
    acceptingRequestId,
    acceptRequest: acceptVisibleRequest,
    clearFocusedFriendRequest,
    declineRequest: declineVisibleRequest,
    decliningRequestId,
    focusedPanel,
    focusedRequestId,
    isAccepting,
    isDeclining,
    isLoading,
    shouldRender,
    visibleRequests,
  };
}
