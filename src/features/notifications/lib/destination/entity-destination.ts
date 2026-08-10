import {
  buildGroupProposalNavigation,
  buildHomeNavigation,
  buildPlanCreationNavigation,
  buildProfileNavigation,
} from "@/shared/navigation";
import type { Notification } from "@/shared/schemas";
import {
  resolvePlanGroupDestination,
  toGroupDestination,
} from "./destination-builders";
import type {
  NotificationDestination,
  NotificationEntityResolver,
} from "./notification-destination.types";
import { extractProposalIdFromLink } from "./notification-link-parser";

const ENTITY_DESTINATION_RESOLVERS: Partial<
  Record<NonNullable<Notification["entityType"]>, NotificationEntityResolver>
> = {
  ACTIVITY: (_notification, entityId) =>
    buildPlanCreationNavigation({
      activityId: entityId,
      open: true,
    }),
  GROUP: (_notification, entityId) =>
    toGroupDestination(entityId, {
      panel: "group",
    }),
  GROUP_PROPOSAL: (_notification, entityId) =>
    buildGroupProposalNavigation(entityId),
  INVITE: (_notification, entityId) =>
    buildHomeNavigation({
      invite: entityId,
      panel: "invitations",
      view: "received",
    }),
  PLAN: resolvePlanEntityDestination,
  USER: resolveUserEntityDestination,
};

export async function resolveEntityDestination(
  notification: Notification,
): Promise<NotificationDestination | null> {
  const { entityId, entityType } = notification;

  if (!entityType || !entityId) {
    return null;
  }

  const entityResolver = ENTITY_DESTINATION_RESOLVERS[entityType];

  if (!entityResolver) {
    return null;
  }

  return entityResolver(notification, entityId);
}

async function resolvePlanEntityDestination(
  notification: Notification,
  planId: string,
) {
  return resolvePlanGroupDestination(planId, {
    proposal: getPlanEntityProposalId(notification),
  });
}

function getPlanEntityProposalId(notification: Notification) {
  return notification.type === "PLAN_PROPOSAL"
    ? extractProposalIdFromLink(notification.link)
    : undefined;
}

function resolveUserEntityDestination(
  notification: Notification,
  userId: string,
) {
  if (notification.type === "FRIEND_REQUEST") {
    return buildHomeNavigation({
      panel: "friends",
      request: userId,
    });
  }

  return buildProfileNavigation(userId);
}
