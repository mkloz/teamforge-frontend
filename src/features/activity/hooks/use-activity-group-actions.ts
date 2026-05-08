import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ActivityCommands } from "@/features/activity/api/activity-commands";
import { currentUserQueryOptions } from "@/shared/api/current-user-query";
import { trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";
import { useClearActivityRouteSelection } from "./use-clear-activity-route-selection";

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
  const currentUserQuery = useQuery(currentUserQueryOptions());
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [invitingMemberId, setInvitingMemberId] = useState<string | null>(null);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const clearRouteSelection = useClearActivityRouteSelection();

  async function leaveGroup() {
    if (!currentUserQuery.data) {
      return;
    }

    setPendingAction("leave");

    try {
      const result = await ActivityCommands.leaveGroup(
        groupId,
        currentUserQuery.data.id,
      );
      await clearRouteSelection();
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
      const result = await ActivityCommands.disbandGroup(
        groupId,
        currentUserQuery.data.id,
      );
      await clearRouteSelection();
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
      const result = await ActivityCommands.removeGroupMember(
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
      const result = await ActivityCommands.sendGroupInvite(groupId, inviteeId);
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
