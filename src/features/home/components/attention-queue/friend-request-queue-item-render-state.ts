import { Clock3, type LucideIcon, MapPin, ShieldCheck } from "lucide-react";

import { buildProfileNavigation } from "@/features/profile/lib/profile-route";

import type { AttentionQueueFriendRequest } from "./attention-queue.types";
import { getFriendRequestMeta } from "./attention-queue-formatters";
import {
  getQueueActionDisabled,
  getQueueItemClassName,
  getQueueOfflineTitle,
} from "./queue-item-render-state";

interface QueueMetaCandidate {
  icon: LucideIcon;
  label: string | null | undefined;
}

interface QueueMetaItem {
  icon: LucideIcon;
  label: string;
}

export interface FriendRequestQueueItemState {
  acceptingRequestId: string | null;
  decliningRequestId: string | null;
  isAccepting: boolean;
  isDeclining: boolean;
  isFocused: boolean;
  isOnline: boolean;
}

interface FriendRequestQueueItemRenderStateInput {
  request: AttentionQueueFriendRequest;
  state: FriendRequestQueueItemState;
}

export function getFriendRequestQueueItemRenderState({
  request,
  state,
}: FriendRequestQueueItemRenderStateInput) {
  const [cityLabel, trustLabel, sentLabel] = getFriendRequestMeta(request);
  const isActionDisabled = getQueueActionDisabled({
    isAccepting: state.isAccepting,
    isDeclining: state.isDeclining,
    isOnline: state.isOnline,
  });

  return {
    acceptButtonDisabled: isActionDisabled,
    acceptButtonLoading: state.acceptingRequestId === request.requesterId,
    actionButtonTitle: getQueueOfflineTitle(
      state.isOnline,
      "Reconnect before responding to friend requests.",
    ),
    declineButtonDisabled: isActionDisabled,
    declineButtonLoading: state.decliningRequestId === request.requesterId,
    firstName: getFirstName(request.counterpart.name),
    profileNavigation: buildProfileNavigation(request.counterpart.id),
    requestMeta: [
      { icon: MapPin, label: cityLabel },
      { icon: ShieldCheck, label: trustLabel },
      { icon: Clock3, label: sentLabel },
    ].filter(hasQueueMetaLabel),
    rowClassName: getQueueItemClassName(
      state.isFocused,
      "hover:bg-forge-teal/5",
    ),
  };
}

function hasQueueMetaLabel(item: QueueMetaCandidate): item is QueueMetaItem {
  return Boolean(item.label);
}

function getFirstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? name;
}
