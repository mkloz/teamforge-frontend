import type { RealtimeEventMeta } from "@/shared/schemas";

const MAX_SEEN_EVENT_IDS = 500;
const seenEventIds = new Map<string, number>();
const latestEntityVersions = new Map<string, number>();

interface RealtimeEventRegistryOptions {
  scope?: string;
}

function pruneSeenEventIds() {
  while (seenEventIds.size > MAX_SEEN_EVENT_IDS) {
    const oldestKey = seenEventIds.keys().next().value;

    if (!oldestKey) {
      break;
    }

    seenEventIds.delete(oldestKey);
  }
}

export function shouldApplyRealtimeEvent(
  event: RealtimeEventMeta,
  options: RealtimeEventRegistryOptions = {},
) {
  if (
    !rememberRealtimeEventId(
      getRealtimeRegistryKey(event.eventId, options.scope),
    )
  ) {
    return false;
  }

  if (event.entityKey === null || event.entityVersion === null) {
    return true;
  }

  return shouldApplyEntityVersion(
    getRealtimeRegistryKey(event.entityKey, options.scope),
    event.entityVersion,
  );
}

function getRealtimeRegistryKey(key: string, scope?: string) {
  return scope ? `${scope}:${key}` : key;
}

function rememberRealtimeEventId(eventId: string) {
  if (seenEventIds.has(eventId)) {
    return false;
  }

  seenEventIds.set(eventId, Date.now());
  pruneSeenEventIds();

  return true;
}

function shouldApplyEntityVersion(entityKey: string, entityVersion: number) {
  if (hasSeenNewerEntityVersion(entityKey, entityVersion)) {
    return false;
  }

  latestEntityVersions.set(entityKey, entityVersion);
  return true;
}

function hasSeenNewerEntityVersion(entityKey: string, entityVersion: number) {
  const latestVersion = latestEntityVersions.get(entityKey);

  return typeof latestVersion === "number" && latestVersion >= entityVersion;
}
