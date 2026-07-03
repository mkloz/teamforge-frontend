import { ActivityCommands } from "@/features/activity/api/activity-commands";
import { ActivityRealtimeHandlers } from "@/features/activity/api/activity-realtime-handlers";
import type { GroupApi } from "@/shared/schemas";

export function invalidateActivityGroupSurfaces() {
  return ActivityCommands.invalidateGroupSurfaces();
}

export function applyActivityGroupUpdate(
  currentUserId: string,
  group: GroupApi,
) {
  ActivityRealtimeHandlers.applyGroupUpdate(currentUserId, group);
}
