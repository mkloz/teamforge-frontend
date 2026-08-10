import type { Notification } from "@/shared/schemas";
import { resolveFromCurrentAppRoute } from "./current-route-destination";
import type { NotificationDestination } from "./notification-destination.types";
import { parseNotificationLink } from "./notification-link-parser";

export function resolveFromNotificationLink(
  notification: Notification,
): NotificationDestination | null {
  const parsedLink = parseNotificationLink(notification.link);

  return parsedLink
    ? resolveFromCurrentAppRoute(parsedLink.pathname, parsedLink.searchParams)
    : null;
}
