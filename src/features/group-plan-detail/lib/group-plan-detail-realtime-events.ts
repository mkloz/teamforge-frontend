import { appQueryClient } from "@/shared/api/query-client";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import { realtimeClient } from "@/shared/api/realtime-client";
import { shouldApplyRealtimeEvent } from "@/shared/lib/realtime-event-registry";
import {
  realtimeGroupUpdatedPayloadSchema,
  realtimePlanUpdatedPayloadSchema,
} from "@/shared/schemas";

interface GroupPlanDetailRealtimeInput {
  groupId: string;
  planId?: string | null;
}

function getGroupPlanDetailRealtimeScope(groupId: string) {
  return `group-plan-detail:${groupId}`;
}

function invalidateGroupPlanDetail(groupId: string) {
  void appQueryClient.invalidateQueries({
    queryKey: APP_QUERY_KEYS.groupPlanDetail.byId(groupId),
  });
}

function handleGroupPlanUpdated(payload: unknown, groupId: string) {
  const parsed = realtimePlanUpdatedPayloadSchema.safeParse(payload);

  if (!parsed.success || parsed.data.groupId !== groupId) {
    return;
  }

  if (
    !shouldApplyRealtimeEvent(parsed.data, {
      scope: getGroupPlanDetailRealtimeScope(groupId),
    })
  ) {
    return;
  }

  invalidateGroupPlanDetail(groupId);
}

function handleGroupUpdated(payload: unknown, groupId: string) {
  const parsed = realtimeGroupUpdatedPayloadSchema.safeParse(payload);

  if (!parsed.success || parsed.data.group.id !== groupId) {
    return;
  }

  if (
    !shouldApplyRealtimeEvent(parsed.data, {
      scope: getGroupPlanDetailRealtimeScope(groupId),
    })
  ) {
    return;
  }

  invalidateGroupPlanDetail(groupId);
}

export function subscribeGroupPlanDetailRealtime({
  groupId,
  planId,
}: GroupPlanDetailRealtimeInput) {
  if (planId) {
    realtimeClient.emit("plan.subscribe", { planId });
  }

  const unsubscribePlanUpdated = realtimeClient.on(
    "plan.updated",
    (payload) => {
      handleGroupPlanUpdated(payload, groupId);
    },
  );
  const unsubscribeGroupUpdated = realtimeClient.on(
    "group.updated",
    (payload) => {
      handleGroupUpdated(payload, groupId);
    },
  );

  return () => {
    unsubscribeGroupUpdated();
    unsubscribePlanUpdated();
    if (planId) {
      realtimeClient.emit("plan.unsubscribe", { planId });
    }
  };
}
