import {
  buildActivityNavigation,
  buildHomeNavigation,
  buildProfileNavigation,
  buildSettingsNavigation,
} from "@/shared/navigation";
import type { Notification } from "@/shared/schemas";
import type {
  NotificationDestination,
  NotificationFallbackResolver,
} from "./notification-destination.types";

const TYPE_FALLBACK_DESTINATION_RESOLVERS: Partial<
  Record<Notification["type"], NotificationFallbackResolver>
> = {
  ACCOUNT_SECURITY: () => buildSettingsNavigation("security"),
  FRIEND_ACCEPTED: () => buildProfileNavigation(),
  FRIEND_REQUEST: (notification) =>
    buildHomeNavigation({
      panel: "friends",
      request: notification.entityId ?? undefined,
    }),
  MESSAGE_MENTION: () => buildActivityNavigation({ filter: "unread" }),
  NEW_MESSAGE: () => buildActivityNavigation({ filter: "unread" }),
};

export function resolveTypeFallbackDestination(
  notification: Notification,
): NotificationDestination {
  return (
    TYPE_FALLBACK_DESTINATION_RESOLVERS[notification.type]?.(notification) ??
    buildHomeNavigation()
  );
}
