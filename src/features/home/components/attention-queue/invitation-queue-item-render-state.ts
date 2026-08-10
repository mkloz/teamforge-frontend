import {
  Clock3,
  Handshake,
  Hourglass,
  type LucideIcon,
  UserRoundPlus,
  UsersRound,
} from "lucide-react";

import { buildGroupPlanDetailNavigation } from "@/shared/navigation";

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
  JOIN_REQUEST: UserRoundPlus,
};

export interface InvitationQueueItemState {
  acceptingInviteId: string | null;
  decliningInviteId: string | null;
  isAccepting: boolean;
  isDeclining: boolean;
  isFocused: boolean;
  isOnline: boolean;
}

interface InvitationQueueItemRenderStateInput {
  invite: AttentionQueueInvitation;
  state: InvitationQueueItemState;
}

export function getInvitationQueueItemRenderState({
  invite,
  state,
}: InvitationQueueItemRenderStateInput) {
  const isActionDisabled = getQueueActionDisabled({
    isAccepting: state.isAccepting,
    isDeclining: state.isDeclining,
    isOnline: state.isOnline,
  });

  return {
    acceptButtonDisabled: isActionDisabled,
    acceptButtonLoading: state.acceptingInviteId === invite.id,
    acceptButtonTitle: getQueueOfflineTitle(
      state.isOnline,
      "Reconnect before accepting invites.",
    ),
    declineButtonDisabled: isActionDisabled,
    declineButtonLoading: state.decliningInviteId === invite.id,
    declineButtonTitle: getQueueOfflineTitle(
      state.isOnline,
      "Reconnect before declining invites.",
    ),
    InviteBadgeIcon: getInviteBadgeIcon(invite.type),
    detailsNavigation: buildGroupPlanDetailNavigation(invite.group.id, {
      source: "invite",
    }),
    inviteMeta: getInviteMeta(invite),
    rowClassName: getQueueItemClassName(
      state.isFocused,
      "hover:bg-primary-soft",
    ),
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
