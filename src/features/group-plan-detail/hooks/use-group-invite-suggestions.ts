import { useMutation, useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { GroupPlanDetailCommands } from "@/features/group-plan-detail/api/group-plan-detail-commands";
import { groupPlanDetailQueries } from "@/features/group-plan-detail/api/group-plan-detail-queries";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import type {
  GroupInviteSuggestion,
  GroupInviteSuggestions,
} from "@/features/group-plan-detail/schemas/group-invite-suggestion.schema";
import { appQueryClient } from "@/shared/api/query-client";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import {
  getApiErrorMessage,
  getHttpErrorStatus,
} from "@/shared/lib/api-error-message";
import { isSystemManagedGroupGovernance } from "@/shared/schemas/group-governance";

export interface GroupInviteSuggestionsState {
  cancellingInviteId: string | null;
  error: string | null;
  isEligible: boolean;
  isInviting: boolean;
  isLoading: boolean;
  isOnline: boolean;
  isRefreshing: boolean;
  items: GroupInviteSuggestion[];
  pendingSuggestionId: string | null;
  onCancelInvitation: (inviteId: string) => Promise<void>;
  onInvite: (suggestionId: string) => Promise<boolean>;
  onRetry: () => void;
}

export function useGroupInviteSuggestions(
  detail: GroupPlanDetail,
): GroupInviteSuggestionsState {
  const eligibility = getSuggestionEligibility(detail);
  const planId = detail.plan?.id ?? "";
  const [actionError, setActionError] = useState<string | null>(null);
  const inviteInFlightRef = useRef(false);
  const cancelInviteInFlightRef = useRef(false);
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();
  const query = useQuery(
    groupPlanDetailQueries.inviteSuggestions(
      detail.group.id,
      planId,
      eligibility,
    ),
  );
  const mutation = useMutation({
    mutationFn: (suggestionId: string) =>
      GroupPlanDetailCommands.inviteSuggestion(
        detail.group.id,
        planId,
        suggestionId,
      ),
    onSuccess: (_result, suggestionId) => {
      setActionError(null);
      removeSuggestionFromCache(detail.group.id, planId, suggestionId);
      return refreshSuggestionContext(detail.group.id, query.refetch);
    },
    onError: (error) => {
      setActionError(getSuggestionActionError(error));
      void refreshSuggestionContext(detail.group.id, query.refetch);
    },
  });
  const cancelMutation = useMutation({
    mutationFn: (inviteId: string) =>
      GroupPlanDetailCommands.cancelInvite(detail.group.id, planId, inviteId),
    onSuccess: () => {
      setActionError(null);
    },
    onError: () => {
      setActionError(
        "We could not cancel that invitation. Refresh the group and try again.",
      );
    },
  });

  async function invite(suggestionId: string) {
    if (inviteInFlightRef.current) {
      return false;
    }

    if (
      guardOfflineAction({
        id: "group-invite-suggestion-offline",
        description: "Reconnect before sending an activity invitation.",
      })
    ) {
      setActionError(
        "You are offline. Reconnect before sending an invitation.",
      );
      return false;
    }

    setActionError(null);
    inviteInFlightRef.current = true;
    try {
      await mutation.mutateAsync(suggestionId);
      return true;
    } catch {
      return false;
    } finally {
      inviteInFlightRef.current = false;
    }
  }

  const responseForCurrentPlan = query.data?.planId === planId;
  const queryError = query.isError
    ? getApiErrorMessage(
        query.error,
        "We could not load invitation suggestions right now.",
        {
          conflictMessage:
            "Suggestions are not available for this plan right now.",
          forbiddenMessage: "You cannot invite people to this group.",
          notFoundMessage: "This group is no longer available.",
        },
      )
    : null;

  return {
    cancellingInviteId: cancelMutation.isPending
      ? (cancelMutation.variables ?? null)
      : null,
    error:
      actionError ??
      queryError ??
      (query.data && !responseForCurrentPlan
        ? "The current plan changed. Refresh suggestions to continue."
        : null),
    isEligible: eligibility,
    isInviting: mutation.isPending,
    isLoading: query.isPending,
    isOnline,
    isRefreshing: query.isFetching && Boolean(query.data),
    items: responseForCurrentPlan ? (query.data?.items ?? []) : [],
    pendingSuggestionId: mutation.isPending ? mutation.variables : null,
    onCancelInvitation: async (inviteId: string) => {
      if (cancelInviteInFlightRef.current) {
        return;
      }

      if (
        guardOfflineAction({
          id: "group-invite-cancel-offline",
          description: "Reconnect before cancelling an invitation.",
        })
      ) {
        return;
      }

      cancelInviteInFlightRef.current = true;

      try {
        await cancelMutation.mutateAsync(inviteId).catch(() => undefined);
      } finally {
        cancelInviteInFlightRef.current = false;
      }
    },
    onInvite: invite,
    onRetry: () =>
      void refreshSuggestionContext(detail.group.id, query.refetch),
  };
}

function removeSuggestionFromCache(
  groupId: string,
  planId: string,
  suggestionId: string,
) {
  appQueryClient.setQueryData<GroupInviteSuggestions>(
    APP_QUERY_KEYS.groupPlanDetail.inviteSuggestions(groupId, planId),
    (current) =>
      current
        ? {
            ...current,
            items: current.items.filter(
              (item) => item.suggestionId !== suggestionId,
            ),
          }
        : current,
  );
}

function getSuggestionActionError(error: unknown) {
  const status = getHttpErrorStatus(error);

  if (status === 404) {
    return "This suggestion is no longer available. Refresh the list to see who is available now.";
  }

  if (status === 409) {
    return "This group or suggestion changed. Refresh the list before trying again.";
  }

  return "We could not send this invitation. Refresh the list and try again.";
}

async function refreshSuggestionContext(
  groupId: string,
  refetchSuggestions: () => Promise<unknown>,
) {
  await Promise.all([
    appQueryClient.invalidateQueries({
      queryKey: APP_QUERY_KEYS.groupPlanDetail.detailAllScopes(groupId),
    }),
    refetchSuggestions(),
  ]);
}

function getSuggestionEligibility(detail: GroupPlanDetail) {
  const governance = detail.governance;
  const isSystemManaged = isSystemManagedGroupGovernance(governance);
  const canInvite = isSystemManaged
    ? detail.viewer.canInviteMembers && governance.capabilities.canInviteMembers
    : governance !== undefined && detail.viewer.canInviteMembers;
  const isOrganizer =
    detail.viewer.role === "ADMIN" || detail.viewer.role === "MODERATOR";
  const plan = detail.plan;
  const isCurrentPlanOpen = plan
    ? plan.status !== "CANCELLED" &&
      plan.status !== "COMPLETED" &&
      (plan.dateTime === null || new Date(plan.dateTime).getTime() > Date.now())
    : false;
  const groupCanAddPeople =
    detail.group.status !== "COMPLETED" &&
    detail.group.status !== "DISBANDED" &&
    detail.group.activeMembersCount + detail.group.pendingInvitationsCount <
      detail.group.maxMembers;

  return canInvite && isOrganizer && isCurrentPlanOpen && groupCanAddPeople;
}
