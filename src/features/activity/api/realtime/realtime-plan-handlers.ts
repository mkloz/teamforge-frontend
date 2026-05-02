import { appQueryClient } from "@/shared/api/query-client";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import type { PlanProposal, PlanUpdateKind, User } from "@/shared/schemas";

import type { ActivityGroupSelectionData } from "@/features/activity/api/activity-query-data";
import { ACTIVITY_GROUPS_QUERY_KEY } from "@/features/activity/api/activity-query-keys";
import type { ActivityRealtimeContext } from "@/features/activity/api/realtime/activity-realtime-types";
import type { Plan } from "@/features/activity/lib/activity-contract";

export async function handleRealtimePlanUpdated(groupId: string) {
  await Promise.all([
    appQueryClient.invalidateQueries({
      queryKey: APP_QUERY_KEYS.activity.groupSelectionById(groupId),
    }),
    appQueryClient.invalidateQueries({ queryKey: ACTIVITY_GROUPS_QUERY_KEY }),
  ]);
}

export function applyRealtimePlanUpdate(
  context: ActivityRealtimeContext,
  groupId: string,
  plan: Plan,
  proposal: PlanProposal | null,
  kind: PlanUpdateKind,
) {
  const currentUser = appQueryClient.getQueryData<User>(
    APP_QUERY_KEYS.auth.currentUser,
  );

  appQueryClient.setQueryData<ActivityGroupSelectionData | undefined>(
    APP_QUERY_KEYS.activity.groupSelectionById(groupId),
    (current) => {
      if (!current?.group || !current.group.plan) {
        return current;
      }

      const currentPlan = current.group.plan;
      const currentProposals = currentPlan.proposals ?? [];
      const nextProposals = proposal
        ? context.mergeProposalIntoList(currentProposals, proposal, kind)
        : currentProposals;
      const nextPlanBase =
        context.getPlanVersion(plan) >= context.getPlanVersion(currentPlan)
          ? {
              ...currentPlan,
              ...plan,
            }
          : currentPlan;
      const nextPlan = {
        ...nextPlanBase,
        proposals: nextProposals,
      };
      const nextGroup = {
        ...current.group,
        plan: nextPlan,
      };

      if (!currentUser) {
        return {
          ...current,
          group: nextGroup,
        };
      }

      const participants = context.buildGroupParticipants(
        nextGroup,
        context.mapCurrentUserParticipant(currentUser),
      );

      return {
        ...current,
        group: nextGroup,
        proposalMessages:
          current.chatId && currentUser
            ? nextProposals.map((item) =>
                context.buildProposalMessage(
                  item,
                  current.chatId!,
                  currentUser.id,
                  participants,
                ),
              )
            : current.proposalMessages,
      };
    },
  );

  void appQueryClient.invalidateQueries({
    queryKey: ACTIVITY_GROUPS_QUERY_KEY,
  });
}
