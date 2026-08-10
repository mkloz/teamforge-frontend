import { type RefObject, useEffect, useEffectEvent } from "react";
import { scrollElementIntoView } from "@/shared/lib/browser-scroll";
import type {
  HomeInvitationView,
  HomePanel,
} from "@/shared/navigation/home-navigation";

import type {
  AttentionQueueFriendRequest,
  AttentionQueueInvitation,
} from "./attention-queue.types";

interface UseAttentionQueueFocusInput {
  focusedPanel: HomePanel | null;
  focusedInviteId: string | null;
  focusedRequestId: string | null;
  invitationView: HomeInvitationView;
  scrollRef: RefObject<HTMLElement | null>;
  visibleInvitations: AttentionQueueInvitation[];
  visibleRequests: AttentionQueueFriendRequest[];
  onClearInvitationFocus?: () => void;
  onClearFriendRequestFocus?: () => void;
}

export function useAttentionQueueFocus({
  focusedInviteId,
  focusedPanel,
  focusedRequestId,
  invitationView,
  onClearFriendRequestFocus,
  onClearInvitationFocus,
  scrollRef,
  visibleInvitations,
  visibleRequests,
}: UseAttentionQueueFocusInput) {
  const clearInvitationFocusFromEffect = useEffectEvent(() => {
    onClearInvitationFocus?.();
  });
  const clearFriendFocusFromEffect = useEffectEvent(() => {
    onClearFriendRequestFocus?.();
  });
  const hasFocusedInvite = visibleInvitations.some(
    (invite) => invite.id === focusedInviteId,
  );
  const hasFocusedRequest = visibleRequests.some(
    (request) => request.requesterId === focusedRequestId,
  );

  useEffect(() => {
    if (focusedPanel !== "invitations" && focusedPanel !== "friends") {
      return;
    }

    scrollElementIntoView(scrollRef.current, {
      intent: "locate",
      block: "start",
    });
  }, [focusedPanel, scrollRef]);

  useEffect(() => {
    if (
      focusedPanel !== "invitations" ||
      invitationView !== "received" ||
      !focusedInviteId
    ) {
      return;
    }

    if (!hasFocusedInvite) {
      clearInvitationFocusFromEffect();
    }
  }, [focusedInviteId, focusedPanel, hasFocusedInvite, invitationView]);

  useEffect(() => {
    if (focusedPanel !== "friends" || !focusedRequestId) {
      return;
    }

    if (!hasFocusedRequest) {
      clearFriendFocusFromEffect();
    }
  }, [focusedPanel, focusedRequestId, hasFocusedRequest]);
}
