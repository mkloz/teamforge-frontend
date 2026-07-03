import {
  extractProposalId,
  matchLegacyChatMessagePath,
  matchLegacyChatPath,
  matchLegacyExploreGroupPath,
  matchLegacyGroupPath,
  matchLegacyGroupPlanPath,
  matchLegacyGroupRatingPath,
  matchLegacyPlanPath,
  matchLegacyPlanProposalPath,
  resolveFriendRequestIntent,
  resolveInviteIntent,
} from "@/features/notifications/lib/notification-intent";
import { buildHomeNavigation } from "@/shared/navigation";
import type { Notification } from "@/shared/schemas";
import { resolveFromCurrentAppRoute } from "./current-route-destination";
import {
  resolvePlanGroupDestination,
  toChatDestination,
  toGroupDestination,
} from "./destination-builders";
import type {
  LegacyDestinationResolver,
  LegacyLinkContext,
  NotificationDestination,
} from "./notification-destination.types";
import {
  extractChatId,
  extractGroupId,
  extractMessageId,
  extractPlanId,
  normalizeNotificationPathname,
  parseNotificationLink,
} from "./notification-link-parser";

const LEGACY_DESTINATION_RESOLVERS: LegacyDestinationResolver[] = [
  resolveCurrentAppRouteDestination,
  resolveLegacyGroupDestination,
  resolveLegacyChatDestination,
  resolveLegacyPlanDestination,
  resolveLegacyRatingDestination,
  resolveLegacyInviteDestination,
  resolveLegacyFriendRequestDestination,
];

export async function resolveFromLegacyLink(
  notification: Notification,
): Promise<NotificationDestination | null> {
  const linkContext = parseLegacyLinkContext(notification);

  if (!linkContext) {
    return null;
  }

  return resolveFirstLegacyDestination(linkContext);
}

async function resolveFirstLegacyDestination(linkContext: LegacyLinkContext) {
  return resolveFirstLegacyDestinationAt(linkContext, 0);
}

async function resolveFirstLegacyDestinationAt(
  linkContext: LegacyLinkContext,
  index: number,
): Promise<NotificationDestination | null> {
  const resolveDestination = LEGACY_DESTINATION_RESOLVERS[index];

  if (!resolveDestination) {
    return null;
  }

  const destination = await resolveDestination(linkContext);

  return destination ?? resolveFirstLegacyDestinationAt(linkContext, index + 1);
}

function resolveCurrentAppRouteDestination({
  pathname,
  searchParams,
}: LegacyLinkContext) {
  return resolveFromCurrentAppRoute(pathname, searchParams);
}

function parseLegacyLinkContext(
  notification: Notification,
): LegacyLinkContext | null {
  if (!notification.link) {
    return null;
  }

  const parsedLink = parseNotificationLink(notification.link);

  if (!parsedLink) {
    return null;
  }

  return {
    messageIdFromSearch: extractMessageId(parsedLink.searchParams),
    notification,
    pathname: normalizeNotificationPathname(parsedLink.pathname),
    planIdFromSearch: extractPlanId(parsedLink.searchParams),
    proposalId: extractProposalId(parsedLink.searchParams),
    searchParams: parsedLink.searchParams,
  };
}

function resolveLegacyGroupDestination({
  pathname,
  planIdFromSearch,
  proposalId,
  searchParams,
}: LegacyLinkContext) {
  return (
    resolveLegacyGroupPlanDestination({
      pathname,
      planIdFromSearch,
      proposalId,
    }) ??
    resolveLegacyGroupPathDestination({
      pathname,
      planIdFromSearch,
      proposalId,
      searchParams,
    })
  );
}

function resolveLegacyGroupPlanDestination({
  pathname,
  planIdFromSearch,
  proposalId,
}: Pick<LegacyLinkContext, "pathname" | "planIdFromSearch" | "proposalId">) {
  const groupPlanMatch = matchLegacyGroupPlanPath(pathname);

  if (!groupPlanMatch) {
    return null;
  }

  return toGroupDestination(groupPlanMatch.groupId, {
    panel: "group",
    plan: groupPlanMatch.planId ?? planIdFromSearch,
    proposal: proposalId ?? undefined,
  });
}

function resolveLegacyGroupPathDestination({
  pathname,
  planIdFromSearch,
  proposalId,
  searchParams,
}: Pick<
  LegacyLinkContext,
  "pathname" | "planIdFromSearch" | "proposalId" | "searchParams"
>) {
  const groupId = resolveLegacyGroupId({ pathname, searchParams });

  if (!groupId) {
    return null;
  }

  return toGroupDestination(groupId, {
    panel: "group",
    plan: planIdFromSearch,
    proposal: proposalId ?? undefined,
  });
}

function resolveLegacyGroupId({
  pathname,
  searchParams,
}: Pick<LegacyLinkContext, "pathname" | "searchParams">) {
  return (
    extractGroupId(searchParams) ??
    matchLegacyGroupPath(pathname) ??
    matchLegacyExploreGroupPath(pathname)
  );
}

async function resolveLegacyChatDestination({
  messageIdFromSearch,
  notification,
  pathname,
  searchParams,
}: LegacyLinkContext) {
  const chatMessageMatch = matchLegacyChatMessagePath(pathname);

  if (chatMessageMatch) {
    return toChatMessageDestination(chatMessageMatch);
  }

  const chatId = getLegacyChatId({ pathname, searchParams });

  if (!chatId) {
    return null;
  }

  return toChatDestination(
    chatId,
    messageIdFromSearch ?? getMessageEntityId(notification),
  );
}

function toChatMessageDestination({
  chatId,
  messageId,
}: {
  chatId: string;
  messageId: string;
}) {
  return toChatDestination(chatId, messageId);
}

function getLegacyChatId({
  pathname,
  searchParams,
}: Pick<LegacyLinkContext, "pathname" | "searchParams">) {
  return extractChatId(searchParams) ?? matchLegacyChatPath(pathname);
}

async function resolveLegacyPlanDestination({
  notification,
  pathname,
  proposalId,
}: LegacyLinkContext) {
  return (
    (await resolveLegacyPlanProposalDestination({ pathname, proposalId })) ??
    resolveLegacyPlanPathDestination({ notification, pathname, proposalId })
  );
}

async function resolveLegacyPlanProposalDestination({
  pathname,
  proposalId,
}: Pick<LegacyLinkContext, "pathname" | "proposalId">) {
  const planProposalMatch = matchLegacyPlanProposalPath(pathname);

  if (!planProposalMatch) {
    return null;
  }

  const planId = planProposalMatch.planId;
  return resolvePlanGroupDestination(planId, {
    proposal: planProposalMatch.proposalId ?? proposalId ?? undefined,
  });
}

async function resolveLegacyPlanPathDestination({
  notification,
  pathname,
  proposalId,
}: Pick<LegacyLinkContext, "notification" | "pathname" | "proposalId">) {
  const planId = matchLegacyPlanPath(pathname);

  if (!planId) {
    return null;
  }

  return resolvePlanGroupDestination(planId, {
    proposal: getLegacyPlanPathProposalId(notification, proposalId),
  });
}

function getLegacyPlanPathProposalId(
  notification: Notification,
  proposalId: string | null,
) {
  return notification.type === "PLAN_PROPOSAL"
    ? (proposalId ?? undefined)
    : undefined;
}

function resolveLegacyRatingDestination({ pathname }: LegacyLinkContext) {
  const groupRatingId = matchLegacyGroupRatingPath(pathname);

  if (!groupRatingId) {
    return null;
  }

  return toGroupDestination(groupRatingId, {
    panel: "group",
  });
}

function resolveLegacyInviteDestination({
  notification,
  pathname,
  searchParams,
}: LegacyLinkContext) {
  const inviteIntent = resolveInviteIntent(pathname, searchParams);

  if (!inviteIntent) {
    return null;
  }

  if (notification.entityType === "GROUP" && notification.entityId) {
    return toGroupDestination(notification.entityId, {
      panel: "group",
    });
  }

  return buildHomeNavigation(inviteIntent);
}

function resolveLegacyFriendRequestDestination({
  pathname,
  searchParams,
}: LegacyLinkContext) {
  const friendRequestIntent = resolveFriendRequestIntent(
    pathname,
    searchParams,
  );

  return friendRequestIntent ? buildHomeNavigation(friendRequestIntent) : null;
}

function getMessageEntityId(notification: Notification) {
  return notification.entityType === "MESSAGE"
    ? (notification.entityId ?? undefined)
    : undefined;
}
