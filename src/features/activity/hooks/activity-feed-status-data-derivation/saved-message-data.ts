import type { ActivityCurrentUserData } from "@/features/activity/hooks/activity-feed-status-data-derivation/types";
import {
  mapSavedMessageApi,
  type SavedMessageSnapshot,
} from "@/features/activity/lib/saved-message";
import type { SavedMessageApi } from "@/shared/schemas";

export function deriveSavedMessageData(
  items: SavedMessageApi[],
  currentUser: ActivityCurrentUserData | undefined,
) {
  const savedMessages = currentUser
    ? mapSavedMessages(items, currentUser.id)
    : [];

  return {
    savedMessages,
    savedMessagesById: getSavedMessagesById(savedMessages),
  };
}

function mapSavedMessages(
  items: SavedMessageApi[],
  currentUserId: string,
): SavedMessageSnapshot[] {
  return items
    .map((item) => mapSavedMessageApi(item, currentUserId))
    .filter((item): item is SavedMessageSnapshot => item !== null)
    .sort(
      (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
    );
}

function getSavedMessagesById(savedMessages: SavedMessageSnapshot[]) {
  return savedMessages.reduce<Record<string, SavedMessageSnapshot>>(
    (byId, snapshot) => {
      byId[snapshot.message.id] = snapshot;
      return byId;
    },
    {},
  );
}
