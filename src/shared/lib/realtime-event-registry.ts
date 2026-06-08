import type { RealtimeEventMeta } from "@/shared/schemas";

const MAX_SEEN_EVENT_IDS = 500;
const seenEventIds = new Map<string, number>();
const latestEntityVersions = new Map<string, number>();

function pruneSeenEventIds() {
  while (seenEventIds.size > MAX_SEEN_EVENT_IDS) {
    const oldestKey = seenEventIds.keys().next().value;

    if (!oldestKey) {
      break;
    }

    seenEventIds.delete(oldestKey);
  }
}

export function shouldApplyRealtimeEvent(event: RealtimeEventMeta) {
  if (seenEventIds.has(event.eventId)) {
    return false;
  }

  seenEventIds.set(event.eventId, Date.now());
  pruneSeenEventIds();

  if (event.entityKey === null || event.entityVersion === null) {
    return true;
  }

  const latestVersion = latestEntityVersions.get(event.entityKey);

  if (
    typeof latestVersion === "number" &&
    latestVersion >= event.entityVersion
  ) {
    return false;
  }

  latestEntityVersions.set(event.entityKey, event.entityVersion);
  return true;
}
