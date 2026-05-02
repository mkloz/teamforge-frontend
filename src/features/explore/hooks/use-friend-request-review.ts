import { useEffect, useEffectEvent, useState } from "react";

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

  const visibleRequests = requests.filter(
    (request) => !hiddenRequestIds.includes(request.requesterId),
  );
  const shouldRender = focusedPanel === "friends" || visibleRequests.length > 0;
  const hasFocusedRequest = visibleRequests.some(
    (request) => request.requesterId === focusedRequestId,
  );
  const clearFocusedRequestFromEffect = useEffectEvent(() => {
    clearFocusedFriendRequest();
  });

  useEffect(() => {
    if (focusedPanel !== "friends" || !focusedRequestId) {
      return;
    }

    if (hasFocusedRequest) {
      return;
    }

    clearFocusedRequestFromEffect();
  }, [focusedPanel, focusedRequestId, hasFocusedRequest]);

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
