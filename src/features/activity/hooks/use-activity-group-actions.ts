import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";

import { AuthQueries } from "@/features/auth/api/auth.queries";
import {
  activityKindValues,
  activityPanelValues,
} from "@/shared/lib/activity-route";

import { ActivityQueries } from "../api/activity.queries";

type PendingAction = "disband" | "leave" | null;

export function useActivityGroupActions(groupId: string) {
  const queryClient = useQueryClient();
  const currentUserQuery = useQuery(AuthQueries.currentUser());
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [invitingMemberId, setInvitingMemberId] = useState<string | null>(null);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [, setRouteState] = useQueryStates(
    {
      kind: parseAsStringLiteral(activityKindValues),
      id: parseAsString,
      panel: parseAsStringLiteral(activityPanelValues),
      plan: parseAsString,
      proposal: parseAsString,
      message: parseAsString,
    },
    {
      history: "replace",
    },
  );

  async function leaveGroup() {
    if (!currentUserQuery.data) {
      return;
    }

    setPendingAction("leave");

    try {
      await ActivityQueries.leaveGroup(groupId, currentUserQuery.data.id);
      await queryClient.invalidateQueries({
        queryKey: ["activity-selection", "group", groupId],
      });
      await setRouteState({
        id: null,
        kind: null,
        message: null,
        panel: null,
        plan: null,
        proposal: null,
      });
    } finally {
      setPendingAction(null);
    }
  }

  async function disbandGroup() {
    if (!currentUserQuery.data) {
      return;
    }

    setPendingAction("disband");

    try {
      await ActivityQueries.disbandGroup(groupId, currentUserQuery.data.id);
      await queryClient.invalidateQueries({
        queryKey: ["activity-selection", "group", groupId],
      });
      await setRouteState({
        id: null,
        kind: null,
        message: null,
        panel: null,
        plan: null,
        proposal: null,
      });
    } finally {
      setPendingAction(null);
    }
  }

  async function removeMember(memberId: string) {
    if (!currentUserQuery.data) {
      return;
    }

    setRemovingMemberId(memberId);

    try {
      await ActivityQueries.removeGroupMember(
        groupId,
        memberId,
        currentUserQuery.data.id,
      );
    } finally {
      setRemovingMemberId(null);
    }
  }

  async function inviteMember(inviteeId: string) {
    setInvitingMemberId(inviteeId);

    try {
      await ActivityQueries.sendGroupInvite(groupId, inviteeId);
    } finally {
      setInvitingMemberId(null);
    }
  }

  return {
    currentUserId: currentUserQuery.data?.id ?? null,
    isDisbanding: pendingAction === "disband",
    isLeaving: pendingAction === "leave",
    invitingMemberId,
    removingMemberId,
    disbandGroup,
    inviteMember,
    leaveGroup,
    removeMember,
  };
}
