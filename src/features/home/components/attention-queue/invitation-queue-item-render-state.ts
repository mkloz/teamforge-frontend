import {
  Clock3,
  Handshake,
  Hourglass,
  type LucideIcon,
  UserRoundPlus,
  UsersRound,
} from "lucide-react";

import { buildGroupPlanDetailNavigation } from "@/features/group-plan-detail/lib/group-plan-detail-route";

import type { AttentionQueueInvitation } from "./attention-queue.types";
import {
  getInviteMemberLabel,
  getQueueMomentLabel,
} from "./attention-queue-formatters";
import {
  getQueueActionDisabled,
  getQueueItemClassName,
  getQueueOfflineTitle,
} from "./queue-item-render-state";

interface QueueMetaCandidate {
  icon: LucideIcon;
  label: string | null;
}

interface QueueMetaItem {
  icon: LucideIcon;
  label: string;
}

const inviteBadgeIconMap: Partial<
  Record<AttentionQueueInvitation["type"], LucideIcon>
> = {
  ALGORITHM_MATCH: UsersRound,
  FRIEND_INVITE: Handshake,
};

interface InvitationQueueItemRenderStateInput {
  acceptingInviteId: string | null;
  decliningInviteId: string | null;
  invite: AttentionQueueInvitation;
  isAccepting: boolean;
  isDeclining: boolean;
  isFocused: boolean;
  isOnline: boolean;
}

export function getInvitationQueueItemRenderState({
  acceptingInviteId,
  decliningInviteId,
  invite,
  isAccepting,
  isDeclining,
  isFocused,
  isOnline,
}: InvitationQueueItemRenderStateInput) {
  const isActionDisabled = getQueueActionDisabled({
    isAccepting,
    isDeclining,
    isOnline,
  });

  return {
    acceptButtonDisabled: isActionDisabled,
    acceptButtonLoading: acceptingInviteId === invite.id,
    acceptButtonTitle: getQueueOfflineTitle(
      isOnline,
      "Reconnect before accepting invites.",
    ),
    declineButtonDisabled: isActionDisabled,
    declineButtonLoading: decliningInviteId === invite.id,
    declineButtonTitle: getQueueOfflineTitle(
      isOnline,
      "Reconnect before declining invites.",
    ),
    InviteBadgeIcon: getInviteBadgeIcon(invite.type),
    detailsNavigation: buildGroupPlanDetailNavigation(invite.group.id, {
      source: "invite",
    }),
    inviteMeta: getInviteMeta(invite),
    rowClassName: getQueueItemClassName(isFocused, "hover:bg-forge-teal/5"),
  };
}

function getInviteMeta(invite: AttentionQueueInvitation) {
  return [
    {
      icon: UsersRound,
      label: getInviteMemberLabel(invite),
    },
    {
      icon: Clock3,
      label: getQueueMomentLabel(invite.createdAt, "Sent"),
    },
    {
      icon: Hourglass,
      label: invite.expiresAt
        ? getQueueMomentLabel(invite.expiresAt, "Expires")
        : null,
    },
  ].filter(hasQueueMetaLabel);
}

function hasQueueMetaLabel(item: QueueMetaCandidate): item is QueueMetaItem {
  return Boolean(item.label);
}

function getInviteBadgeIcon(
  type: AttentionQueueInvitation["type"],
): LucideIcon {
  return inviteBadgeIconMap[type] ?? UserRoundPlus;
}
