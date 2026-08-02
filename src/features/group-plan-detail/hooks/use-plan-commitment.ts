import { useMutation, useQuery } from "@tanstack/react-query";
import { GroupPlanDetailCommands } from "@/features/group-plan-detail/api/group-plan-detail-commands";
import { groupPlanDetailQueries } from "@/features/group-plan-detail/api/group-plan-detail-queries";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import type { PlanCommitmentResponse } from "@/features/group-plan-detail/schemas/plan-commitment.schema";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";

const MEMBER_RELATIONSHIPS = new Set(["ADMIN", "MEMBER", "MODERATOR"]);

export function usePlanCommitment(detail: GroupPlanDetail) {
  const plan = detail.plan;
  const canRespond = Boolean(
    plan &&
      !["CANCELLED", "COMPLETED"].includes(plan.status) &&
      MEMBER_RELATIONSHIPS.has(detail.viewer.relationship),
  );
  const query = useQuery(
    groupPlanDetailQueries.commitmentReadiness(plan?.id ?? "", canRespond),
  );
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();
  const mutation = useMutation({
    mutationKey: ["group-plan-detail", "commitment", plan?.id],
    mutationFn: (response: PlanCommitmentResponse) => {
      if (!plan) throw new Error("A current plan is required.");
      return GroupPlanDetailCommands.setCommitment({
        expectedMaterialRevision:
          query.data?.materialRevision ?? plan.materialRevision,
        groupId: detail.group.id,
        planId: plan.id,
        response,
      });
    },
    meta: {
      errorToastMessage: "We couldn't save your plan response.",
      telemetryName: "group_plan_commitment_set",
    },
  });

  return {
    canRespond,
    isOnline,
    mutation,
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
