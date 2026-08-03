import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GroupPlanDetailCommands } from "@/features/group-plan-detail/api/group-plan-detail-commands";
import { groupPlanDetailQueries } from "@/features/group-plan-detail/api/group-plan-detail-queries";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import type { PlanCommitmentResponse } from "@/features/group-plan-detail/schemas/plan-commitment.schema";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import {
  getMutationOutcomeCode,
  presentMutationOutcome,
} from "@/shared/lib/lifecycle-presenters";
import type { PlanOperationalState } from "@/shared/schemas/plan-operational-state";

const MEMBER_RELATIONSHIPS = new Set(["ADMIN", "MEMBER", "MODERATOR"]);

export function usePlanCommitment(
  detail: GroupPlanDetail,
  operationalState?: PlanOperationalState,
) {
  const plan = detail.plan;
  const canRespond = operationalState
    ? operationalState.viewer.capabilities.setCommitment
    : Boolean(
        plan &&
          !["CANCELLED", "COMPLETED"].includes(plan.status) &&
          MEMBER_RELATIONSHIPS.has(detail.viewer.relationship),
      );
  const query = useQuery(
    groupPlanDetailQueries.commitmentReadiness(plan?.id ?? "", canRespond),
  );
  const queryClient = useQueryClient();
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();
  const mutation = useMutation({
    mutationKey: ["group-plan-detail", "commitment", plan?.id],
    mutationFn: (response: PlanCommitmentResponse) => {
      if (!plan) throw new Error("A current plan is required.");
      return GroupPlanDetailCommands.setCommitment({
        expectedMaterialRevision:
          operationalState?.materialRevision ??
          query.data?.materialRevision ??
          plan.materialRevision,
        groupId: detail.group.id,
        planId: plan.id,
        response,
      });
    },
    meta: {
      errorToastMessage: "We couldn't save your plan response.",
      telemetryName: "group_plan_commitment_set",
    },
    onError: async () => {
      if (!plan) return;
      await Promise.all([
        query.refetch(),
        queryClient.invalidateQueries({
          queryKey: APP_QUERY_KEYS.groupPlanDetail.operationalState(plan.id),
        }),
      ]);
    },
  });

  return {
    canRespond,
    isOnline,
    mutation,
    mutationOutcome: mutation.isError
      ? presentMutationOutcome(getMutationOutcomeCode(mutation.error))
      : null,
    query,
    respond(response: PlanCommitmentResponse) {
      if (
        guardOfflineAction({
          description: "Reconnect before changing your plan response.",
          id: "plan-commitment-offline",
        })
      ) {
        return;
      }
      mutation.mutate(response);
    },
  };
}
