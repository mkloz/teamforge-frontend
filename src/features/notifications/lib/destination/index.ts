import type { Notification } from "@/shared/schemas";
import { resolveEntityDestination } from "./entity-destination";
import { resolveTypeFallbackDestination } from "./fallback-destination";
import { resolveFromLegacyLink } from "./legacy-link-destination";
import type { NotificationDestination } from "./notification-destination.types";

export type { NotificationDestination } from "./notification-destination.types";

export async function resolveNotificationDestination(
  notification: Notification,
): Promise<NotificationDestination> {
  const fromLink = await resolveFromLegacyLink(notification);

  if (fromLink) {
    return fromLink;
  }

  const fromEntity = await resolveEntityDestination(notification);

  if (fromEntity) {
    return fromEntity;
  }

  return resolveTypeFallbackDestination(notification);
}
