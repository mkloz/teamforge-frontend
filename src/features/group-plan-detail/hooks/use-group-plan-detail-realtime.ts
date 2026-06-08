import { useEffect } from "react";
import { appQueryClient } from "@/shared/api/query-client";
import {
  cancelIdleTask,
  scheduleIdleTask,
} from "@/shared/lib/browser-scheduling";

interface UseGroupPlanDetailRealtimeInput {
  groupId: string;
  planId?: string | null;
}

export function useGroupPlanDetailRealtime({
  groupId,
  planId,
}: UseGroupPlanDetailRealtimeInput) {
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    const idleTask = scheduleIdleTask(() => {
      void initializeRealtime();
    });

    async function initializeRealtime() {
      const [
        { APP_QUERY_KEYS },
        { realtimeClient },
        { realtimeGroupUpdatedPayloadSchema, realtimePlanUpdatedPayloadSchema },
      ] = await Promise.all([
        import("@/shared/api/query-keys"),
        import("@/shared/api/realtime-client"),
        import("@/shared/schemas"),
      ]);

      if (cancelled) {
        return;
      }

      function invalidateGroupPlanDetail() {
        void appQueryClient.invalidateQueries({
          queryKey: APP_QUERY_KEYS.groupPlanDetail.byId(groupId),
        });
      }

      function handlePlanUpdated(payload: unknown) {
        const parsed = realtimePlanUpdatedPayloadSchema.safeParse(payload);

        if (!parsed.success || parsed.data.groupId !== groupId) {
          return;
        }

        invalidateGroupPlanDetail();
      }

      function handleGroupUpdated(payload: unknown) {
        const parsed = realtimeGroupUpdatedPayloadSchema.safeParse(payload);

        if (!parsed.success || parsed.data.group.id !== groupId) {
          return;
        }

        invalidateGroupPlanDetail();
      }

      if (planId) {
        realtimeClient.emit("plan.subscribe", { planId });
      }

      const unsubscribePlanUpdated = realtimeClient.on(
        "plan.updated",
        handlePlanUpdated,
      );
      const unsubscribeGroupUpdated = realtimeClient.on(
        "group.updated",
        handleGroupUpdated,
      );

      cleanup = () => {
        unsubscribeGroupUpdated();
        unsubscribePlanUpdated();
        if (planId) {
          realtimeClient.emit("plan.unsubscribe", { planId });
        }
      };
    }

    return () => {
      cancelled = true;
      cancelIdleTask(idleTask);
      cleanup?.();
    };
  }, [groupId, planId]);
}
