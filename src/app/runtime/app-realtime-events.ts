import {
  applyActivityGroupUpdate,
  invalidateActivityGroupSurfaces,
} from "@/features/activity/public/activity-app-realtime";
import {
  type CurrentForgeProposalResponse,
  FORGE_PROPOSAL_QUERY_KEYS,
} from "@/features/forge-proposals/public/proposal-review";
import { addIncomingNotification } from "@/features/notifications/public/notification-realtime";
import { authSession } from "@/shared/api/auth-session";
import { CURRENT_USER_QUERY_KEY } from "@/shared/api/current-user-query";
import { appQueryClient } from "@/shared/api/query-client";
import { refreshAccessSensitiveSurfaces } from "@/shared/api/query-invalidation";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import { realtimeClient } from "@/shared/api/realtime-client";
import { shouldApplyRealtimeEvent } from "@/shared/lib/realtime-event-registry";
import {
  realtimeAccessChangedPayloadSchema,
  realtimeForgeProposalUpdatedPayloadSchema,
  realtimeGroupUpdatedPayloadSchema,
  realtimeNotificationPayloadSchema,
} from "@/shared/schemas/realtime";
import type { User } from "@/shared/schemas/user";

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

  if (!shouldApplyRealtimeEvent(parsed)) {
    return;
  }

  const currentUser = getCachedCurrentUser();

  if (!currentUser) {
    void invalidateActivityGroupSurfaces();
    return;
  }

  applyActivityGroupUpdate(currentUser.id, parsed.group);
}

function handleAccessChangedPayload(payload: unknown) {
  const parsed = realtimeAccessChangedPayloadSchema.parse(payload);

  if (!shouldApplyRealtimeEvent(parsed)) {
    return;
  }

  const rosterReset = clearForgeProposalRosterCaches();
  void Promise.all([
    rosterReset,
    refreshAccessSensitiveSurfaces(),
    refreshForgeProposalState(),
  ]);
}

function handleForgeProposalUpdatedPayload(payload: unknown) {
  const parsed = realtimeForgeProposalUpdatedPayloadSchema.parse(payload);

  if (!shouldApplyRealtimeEvent(parsed)) {
    return;
  }

  const rosterReset = clearForgeProposalRosterCaches(parsed.proposalId);
  void Promise.all([rosterReset, refreshForgeProposalSurfaces()]);
}

function clearForgeProposalRosterCaches(proposalId?: string) {
  const detailReset = appQueryClient.resetQueries({
    ...(proposalId ? { exact: true } : {}),
    queryKey: proposalId
      ? FORGE_PROPOSAL_QUERY_KEYS.detail(proposalId)
      : ([...FORGE_PROPOSAL_QUERY_KEYS.all, "detail"] as const),
  });
  appQueryClient.setQueryData<CurrentForgeProposalResponse>(
    FORGE_PROPOSAL_QUERY_KEYS.current,
    (current) =>
      !proposalId || current?.proposal?.id === proposalId
        ? { proposal: null }
        : current,
  );
  return detailReset;
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
  const unsubscribeForgeProposalUpdate = realtimeClient.on(
    "forge.proposal.updated",
    handleForgeProposalUpdatedPayload,
  );

  return () => {
    unsubscribeAccessChange();
    unsubscribeForgeProposalUpdate();
    unsubscribeGroupUpdate();
    unsubscribeNotification();
  };
}
