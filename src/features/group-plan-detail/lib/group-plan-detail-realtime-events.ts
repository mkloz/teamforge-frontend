import { appQueryClient } from "@/shared/api/query-client";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import { realtimeClient } from "@/shared/api/realtime-client";
import { shouldApplyRealtimeEvent } from "@/shared/lib/realtime-event-registry";
import {
  realtimeGroupUpdatedPayloadSchema,
  realtimePlanUpdatedPayloadSchema,
  realtimePresenceChangedPayloadSchema,
} from "@/shared/schemas";
import {
  type GroupPlanDetailResponse,
  isRichGroupPlanDetail,
} from "../schemas/group-plan-detail.schema";

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

function handlePresenceChanged(payload: unknown, groupId: string) {
  const parsed = realtimePresenceChangedPayloadSchema.safeParse(payload);

  if (!parsed.success) {
    return;
  }

  appQueryClient.setQueriesData<GroupPlanDetailResponse>(
    {
      queryKey: APP_QUERY_KEYS.groupPlanDetail.detailAllScopes(groupId),
    },
    (current) =>
      isRichGroupPlanDetail(current)
        ? {
            ...current,
            members: current.members.map((member) =>
              member.userId === parsed.data.user.id
                ? {
                    ...member,
                    lastSeenAt: parsed.data.user.lastSeenAt,
                    onlineStatus: parsed.data.onlineStatus,
                  }
                : member,
            ),
          }
        : current,
  );
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
  const unsubscribePresenceChanged = realtimeClient.on(
    "presence.changed",
    (payload) => {
      handlePresenceChanged(payload, groupId);
    },
  );

  return () => {
    unsubscribeGroupUpdated();
    unsubscribePlanUpdated();
    unsubscribePresenceChanged();
    if (planId) {
      realtimeClient.emit("plan.unsubscribe", { planId });
    }
  };
}
