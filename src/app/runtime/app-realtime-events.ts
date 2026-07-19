import {
  applyActivityGroupUpdate,
  invalidateActivityGroupSurfaces,
} from "@/features/activity/public/activity-app-realtime";
import {
  clearForgeProposalSensitiveCaches,
  FORGE_PROPOSAL_QUERY_KEYS,
} from "@/features/forge-proposals/public/proposal-review";
import { addIncomingNotification } from "@/features/notifications/public/notification-realtime";
import { authSession } from "@/shared/api/auth-session";
import { CURRENT_USER_QUERY_KEY } from "@/shared/api/current-user-query";
import { appQueryClient } from "@/shared/api/query-client";
import {
  invalidateFormationOpeningApplicationSurfaces,
  invalidatePlanDecisionSurfaces,
  refreshAccessSensitiveSurfaces,
} from "@/shared/api/query-invalidation";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import { realtimeClient } from "@/shared/api/realtime-client";
import { shouldApplyRealtimeEvent } from "@/shared/lib/realtime-event-registry";
import {
  realtimeAccessChangedPayloadSchema,
  realtimeForgeProposalUpdatedPayloadSchema,
  realtimeGroupUpdatedPayloadSchema,
  realtimeNotificationPayloadSchema,
  realtimePlanUpdatedPayloadSchema,
} from "@/shared/schemas/realtime";
import type { User } from "@/shared/schemas/user";

const APP_GROUP_REALTIME_SCOPE = "app-runtime:group-updated";
const APP_PLAN_REALTIME_SCOPE = "app-runtime:plan-updated";

// These exports are consumed by AppRealtimeSync through loadAppRealtimeEvents().
// Fallow does not trace the destructured API of that dynamic import.
function getCachedCurrentUser() {
  return appQueryClient.getQueryData<User>(CURRENT_USER_QUERY_KEY);
}

function handleNotificationPayload(payload: unknown) {
  const parsed = realtimeNotificationPayloadSchema.parse(payload);

  if (!shouldApplyRealtimeEvent(parsed)) {
    return;
  }

  addIncomingNotification(parsed.notification);
}

function handleGroupUpdatedPayload(payload: unknown) {
  const parsed = realtimeGroupUpdatedPayloadSchema.parse(payload);

  if (
    !shouldApplyRealtimeEvent(parsed, {
      scope: APP_GROUP_REALTIME_SCOPE,
    })
  ) {
    return;
  }

  const currentUser = getCachedCurrentUser();

  if (!currentUser) {
    void invalidateActivityGroupSurfaces();
    return;
  }

  applyActivityGroupUpdate(currentUser.id, parsed.group);
}

function handlePlanUpdatedPayload(payload: unknown) {
  const parsed = realtimePlanUpdatedPayloadSchema.parse(payload);

  if (
    !shouldApplyRealtimeEvent(parsed, {
      scope: APP_PLAN_REALTIME_SCOPE,
    })
  ) {
    return;
  }

  void invalidatePlanDecisionSurfaces({
    groupId: parsed.groupId,
    planId: parsed.planId,
  });
}

function handleAccessChangedPayload(payload: unknown) {
  const parsed = realtimeAccessChangedPayloadSchema.parse(payload);

  if (!shouldApplyRealtimeEvent(parsed)) {
    return;
  }

  const rosterReset = clearForgeProposalSensitiveCaches(appQueryClient);
  void rosterReset.then(() =>
    Promise.all([
      invalidateFormationOpeningApplicationSurfaces(),
      refreshAccessSensitiveSurfaces(),
      refreshForgeProposalState(),
    ]),
  );
}

function handleForgeProposalUpdatedPayload(payload: unknown) {
  const parsed = realtimeForgeProposalUpdatedPayloadSchema.parse(payload);

  if (!shouldApplyRealtimeEvent(parsed)) {
    return;
  }

  const rosterReset = clearForgeProposalSensitiveCaches(
    appQueryClient,
    parsed.proposalId,
  );
  void rosterReset.then(() =>
    Promise.all([
      invalidateFormationOpeningApplicationSurfaces(),
      refreshForgeProposalSurfaces(),
    ]),
  );
}

function refreshForgeProposalState() {
  return Promise.all([
    appQueryClient.invalidateQueries({
      queryKey: FORGE_PROPOSAL_QUERY_KEYS.current,
    }),
    appQueryClient.invalidateQueries({
      queryKey: APP_QUERY_KEYS.forge.currentAutoRequest,
    }),
  ]);
}

function refreshForgeProposalSurfaces() {
  return Promise.all([
    appQueryClient.invalidateQueries({
      queryKey: APP_QUERY_KEYS.activity.groups,
    }),
    appQueryClient.invalidateQueries({
      queryKey: APP_QUERY_KEYS.activity.chats,
    }),
    refreshForgeProposalState(),
    appQueryClient.invalidateQueries({ queryKey: APP_QUERY_KEYS.home.groups }),
  ]);
}

function syncRealtimeSession() {
  realtimeClient.syncSession(authSession.getAccessToken());
}

// fallow-ignore-next-line unused-export
export function reconnectRealtimeSession() {
  realtimeClient.reconnectSession(authSession.getAccessToken());
}

// fallow-ignore-next-line unused-export
export function subscribeRealtimeSessionSync() {
  syncRealtimeSession();

  return authSession.subscribe(syncRealtimeSession);
}

// fallow-ignore-next-line unused-export
export function disconnectRealtimeSession() {
  realtimeClient.syncSession(null);
}

// fallow-ignore-next-line unused-export
export function subscribeAppRealtimeEvents() {
  const unsubscribeAccessChange = realtimeClient.on(
    "access.changed",
    handleAccessChangedPayload,
  );
  const unsubscribeNotification = realtimeClient.on(
    "notification.new",
    handleNotificationPayload,
  );
  const unsubscribeGroupUpdate = realtimeClient.on(
    "group.updated",
    handleGroupUpdatedPayload,
  );
  const unsubscribePlanUpdate = realtimeClient.on(
    "plan.updated",
    handlePlanUpdatedPayload,
  );
  const unsubscribeForgeProposalUpdate = realtimeClient.on(
    "forge.proposal.updated",
    handleForgeProposalUpdatedPayload,
  );

  return () => {
    unsubscribeAccessChange();
    unsubscribeForgeProposalUpdate();
    unsubscribeGroupUpdate();
    unsubscribeNotification();
    unsubscribePlanUpdate();
  };
}
