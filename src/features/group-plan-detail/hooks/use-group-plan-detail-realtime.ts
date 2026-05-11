import { useEffect, useEffectEvent } from "react";
import { appQueryClient } from "@/shared/api/query-client";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import { realtimeClient } from "@/shared/api/realtime-client";
import {
  realtimeGroupUpdatedPayloadSchema,
  realtimePlanUpdatedPayloadSchema,
} from "@/shared/schemas";

interface UseGroupPlanDetailRealtimeInput {
  groupId: string;
  planId?: string | null;
}

function invalidateGroupPlanDetail(groupId: string) {
  void appQueryClient.invalidateQueries({
    queryKey: APP_QUERY_KEYS.groupPlanDetail.byId(groupId),
  });
}

export function useGroupPlanDetailRealtime({
  groupId,
  planId,
}: UseGroupPlanDetailRealtimeInput) {
  const handlePlanUpdated = useEffectEvent((payload: unknown) => {
    const parsed = realtimePlanUpdatedPayloadSchema.safeParse(payload);

    if (!parsed.success || parsed.data.groupId !== groupId) {
      return;
    }

    invalidateGroupPlanDetail(groupId);
  });

  const handleGroupUpdated = useEffectEvent((payload: unknown) => {
    const parsed = realtimeGroupUpdatedPayloadSchema.safeParse(payload);

    if (!parsed.success || parsed.data.group.id !== groupId) {
      return;
    }

    invalidateGroupPlanDetail(groupId);
  });

  useEffect(() => {
    if (!planId) {
      return undefined;
    }

    realtimeClient.emit("plan.subscribe", { planId });

    return () => {
      realtimeClient.emit("plan.unsubscribe", { planId });
    };
  }, [planId]);

  useEffect(() => {
    const unsubscribePlanUpdated = realtimeClient.on(
      "plan.updated",
      handlePlanUpdated,
    );
    const unsubscribeGroupUpdated = realtimeClient.on(
      "group.updated",
      handleGroupUpdated,
    );

    return () => {
      unsubscribeGroupUpdated();
      unsubscribePlanUpdated();
    };
  }, []);
}
