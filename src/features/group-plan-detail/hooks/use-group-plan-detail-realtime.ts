import { useEffect } from "react";
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
      const { subscribeGroupPlanDetailRealtime } = await import(
        "@/features/group-plan-detail/lib/group-plan-detail-realtime-events"
      );

      if (cancelled) {
        return;
      }

      cleanup = subscribeGroupPlanDetailRealtime({ groupId, planId });
    }

    return () => {
      cancelled = true;
      cancelIdleTask(idleTask);
      cleanup?.();
    };
  }, [groupId, planId]);
}
