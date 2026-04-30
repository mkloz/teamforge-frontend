import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";

import { AuthQueries } from "@/features/auth/api/auth.queries";
import {
  activityKindValues,
  activityPanelValues,
} from "@/shared/lib/activity-route";
import { trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";

import { ActivityQueries } from "../api/activity.queries";

type PendingAction = "disband" | "leave" | null;

function trackGroupAction(
  mutation: string,
  status: "success" | "error",
  groupId: string,
  requestId?: string | null,
) {
  trackMutationOutcome(mutation, status, { groupId, requestId });
}

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
      const result = await ActivityQueries.leaveGroup(
        groupId,
        currentUserQuery.data.id,
      );
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
      trackGroupAction(
        trackedMutationNames.activityGroupLeave,
        "success",
        groupId,
        result.requestId,
      );
    } catch (error) {
      trackGroupAction(
        trackedMutationNames.activityGroupLeave,
        "error",
        groupId,
      );
      throw error;
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
      const result = await ActivityQueries.disbandGroup(
        groupId,
        currentUserQuery.data.id,
      );
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
      trackGroupAction(
        trackedMutationNames.activityGroupDisband,
        "success",
        groupId,
        result.requestId,
      );
    } catch (error) {
      trackGroupAction(
        trackedMutationNames.activityGroupDisband,
        "error",
        groupId,
      );
      throw error;
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
      const result = await ActivityQueries.removeGroupMember(
        groupId,
        memberId,
        currentUserQuery.data.id,
      );
      trackMutationOutcome(
        trackedMutationNames.activityGroupRemoveMember,
        "success",
        {
          groupId,
          requestId: result.requestId,
        },
      );
    } catch (error) {
      trackMutationOutcome(
        trackedMutationNames.activityGroupRemoveMember,
        "error",
        {
          groupId,
        },
      );
      throw error;
    } finally {
      setRemovingMemberId(null);
    }
  }

  async function inviteMember(inviteeId: string) {
    setInvitingMemberId(inviteeId);

    try {
      const result = await ActivityQueries.sendGroupInvite(groupId, inviteeId);
      trackMutationOutcome(
        trackedMutationNames.activityGroupInvite,
        "success",
        {
          groupId,
          requestId: result.requestId,
        },
      );
    } catch (error) {
      trackMutationOutcome(trackedMutationNames.activityGroupInvite, "error", {
        groupId,
      });
      throw error;
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
