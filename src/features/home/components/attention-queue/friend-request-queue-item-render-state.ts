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

interface FriendRequestQueueItemRenderStateInput {
  acceptingRequestId: string | null;
  decliningRequestId: string | null;
  isAccepting: boolean;
  isDeclining: boolean;
  isFocused: boolean;
  isOnline: boolean;
  request: AttentionQueueFriendRequest;
}

export function getFriendRequestQueueItemRenderState({
  acceptingRequestId,
  decliningRequestId,
  isAccepting,
  isDeclining,
  isFocused,
  isOnline,
  request,
}: FriendRequestQueueItemRenderStateInput) {
  const [cityLabel, trustLabel, sentLabel] = getFriendRequestMeta(request);
  const isActionDisabled = getQueueActionDisabled({
    isAccepting,
    isDeclining,
    isOnline,
  });

  return {
    acceptButtonDisabled: isActionDisabled,
    acceptButtonLoading: acceptingRequestId === request.requesterId,
    actionButtonTitle: getQueueOfflineTitle(
      isOnline,
      "Reconnect before responding to friend requests.",
    ),
    declineButtonDisabled: isActionDisabled,
    declineButtonLoading: decliningRequestId === request.requesterId,
    firstName: getFirstName(request.counterpart.name),
    profileNavigation: buildProfileNavigation(request.counterpart.id),
    requestMeta: [
      { icon: MapPin, label: cityLabel },
      { icon: ShieldCheck, label: trustLabel },
      { icon: Clock3, label: sentLabel },
    ].filter(hasQueueMetaLabel),
    rowClassName: getQueueItemClassName(isFocused, "hover:bg-forge-teal/5"),
  };
}

function hasQueueMetaLabel(item: QueueMetaCandidate): item is QueueMetaItem {
  return Boolean(item.label);
}

function getFirstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? name;
}
