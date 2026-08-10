import type { Notification } from "@/shared/schemas";
import { resolveEntityDestination } from "./entity-destination";
import { resolveTypeFallbackDestination } from "./fallback-destination";
import { resolveFromNotificationLink } from "./link-destination";
import type { NotificationDestination } from "./notification-destination.types";

export type { NotificationDestination } from "./notification-destination.types";

export async function resolveNotificationDestination(
  notification: Notification,
): Promise<NotificationDestination> {
  const fromLink = resolveFromNotificationLink(notification);

  if (fromLink) {
    return fromLink;
  }

  const fromEntity = await resolveEntityDestination(notification);

  if (fromEntity) {
    return fromEntity;
  }

  return resolveTypeFallbackDestination(notification);
}
