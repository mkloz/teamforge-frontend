import {
  buildExploreNavigation,
  type ExploreRouteSearch,
} from "@/features/explore/public/explore-navigation";
import { buildGroupPlanDetailNavigation } from "@/features/group-plan-detail/public/group-plan-detail-navigation";
import {
  matchLegacyChatMessagePath,
  matchLegacyChatPath,
  matchLegacyExploreGroupPath,
  matchLegacyGroupPath,
  matchLegacyGroupPlanPath,
  matchLegacyGroupRatingPath,
  matchLegacyPlanPath,
  matchLegacyPlanProposalPath,
  matchLegacyUserPath,
  resolveFriendRequestIntent,
  resolveInviteIntent,
} from "@/features/notifications/lib/notification-intent";
import {
  type ActivityRouteSearch,
  activityDensityValues,
  activityFilterValues,
  activityKindValues,
  activityPanelValues,
  buildActivityDmNavigation,
  buildActivityGroupNavigation,
  buildActivityNavigation,
} from "@/shared/navigation/activity-navigation";
import {
  buildForgeNavigation,
  type ForgeRouteSearch,
  forgeSearchModeValues,
} from "@/shared/navigation/forge-navigation";
import {
  buildHomeNavigation,
  type HomeRouteSearch,
  homeInvitationViewValues,
  homePanelValues,
} from "@/shared/navigation/home-navigation";
import { buildProfileNavigation } from "@/shared/navigation/profile-navigation";
import {
  buildSettingsNavigation,
  normalizeSettingsSection,
} from "@/shared/navigation/settings-navigation";
import type { Notification } from "@/shared/schemas";
import {
  resolveGroupIdByChatId,
  resolveGroupIdByPlanId,
} from "./group-lookup-cache";
import type {
  CurrentRouteDestinationResolver,
  LegacyDestinationResolver,
  LegacyLinkContext,
  NotificationDestination,
  NotificationEntityResolver,
  NotificationFallbackResolver,
} from "./notification-destination.types";

export type { NotificationDestination } from "./notification-destination.types";

import { extractProposalId } from "../notification-intent";
import {
  extractChatId,
  extractGroupId,
  extractMessageId,
  extractPlanId,
  extractProposalIdFromLink,
  findLiteral,
  getFirstSearchParam,
  normalizeNotificationPathname,
  parseNotificationLink,
} from "./notification-link-parser";

const CURRENT_ROUTE_DESTINATION_RESOLVERS: Record<
  string,
  CurrentRouteDestinationResolver
> = {
  "/activity": (searchParams) =>
    buildActivityNavigation(resolveActivitySearch(searchParams)),
  "/explore": (searchParams) =>
    buildExploreNavigation(resolveExploreSearch(searchParams)),
  "/forge": (searchParams) =>
    buildForgeNavigation(resolveForgeSearch(searchParams)),
  "/home": (searchParams) =>
    buildHomeNavigation(resolveHomeSearch(searchParams)),
  "/profile": () => buildProfileNavigation(),
  "/settings": (searchParams) =>
    buildSettingsNavigation(
      normalizeSettingsSection(searchParams.get("section")),
    ),
};

const ENTITY_DESTINATION_RESOLVERS: Partial<
  Record<NonNullable<Notification["entityType"]>, NotificationEntityResolver>
> = {
  ACTIVITY: (_notification, entityId) =>
    buildForgeNavigation({
      activityId: entityId,
      open: true,
    }),
  GROUP: (_notification, entityId) =>
    toGroupDestination(entityId, {
      panel: "group",
    }),
  INVITE: (_notification, entityId) =>
    buildHomeNavigation({
      invite: entityId,
      panel: "invitations",
      view: "received",
    }),
  PLAN: resolvePlanEntityDestination,
  USER: resolveUserEntityDestination,
};

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

const LEGACY_DESTINATION_RESOLVERS: LegacyDestinationResolver[] = [
  resolveCurrentAppRouteDestination,
  resolveLegacyGroupDestination,
  resolveLegacyChatDestination,
  resolveLegacyPlanDestination,
  resolveLegacyRatingDestination,
  resolveLegacyInviteDestination,
  resolveLegacyFriendRequestDestination,
];

function toGroupDestination(
  groupId: string,
  options?: {
    panel?: "group";
    plan?: string;
    proposal?: string;
    message?: string;
  },
): NotificationDestination {
  if (options?.message) {
    return toGroupMessageDestination(groupId, options.message);
  }

  return buildGroupPlanDestination(groupId, options);
}

function toGroupMessageDestination(
  groupId: string,
  message: string,
): NotificationDestination {
  return buildActivityGroupNavigation(groupId, {
    panel: "group",
    message,
  });
}

function buildGroupPlanDestination(
  groupId: string,
  options?: {
    panel?: "group";
    plan?: string;
    proposal?: string;
  },
): NotificationDestination {
  return buildGroupPlanDetailNavigation(groupId, {
    plan: options?.plan,
    proposal: options?.proposal,
    source: "notification",
  });
}

function toDirectMessageDestination(
  chatId: string,
  messageId?: string,
): NotificationDestination {
  return buildActivityDmNavigation(chatId, {
    message: messageId,
  });
}

async function toChatDestination(
  chatId: string,
  messageId?: string,
): Promise<NotificationDestination> {
  const groupId = await resolveGroupIdByChatId(chatId);

  if (groupId) {
    return toGroupDestination(groupId, {
      message: messageId,
      panel: "group",
    });
  }

  return toDirectMessageDestination(chatId, messageId);
}

function resolveActivitySearch(
  searchParams: URLSearchParams,
): ActivityRouteSearch {
  return {
    density: resolveActivityDensity(searchParams),
    filter: resolveActivityFilter(searchParams),
    id: searchParams.get("id") ?? undefined,
    kind: findLiteral(activityKindValues, searchParams.get("kind")),
    message: extractMessageId(searchParams),
    panel: findLiteral(activityPanelValues, searchParams.get("panel")),
    plan: extractPlanId(searchParams),
    proposal: getOptionalProposalId(searchParams),
    q: searchParams.get("q") ?? undefined,
  };
}

function resolveActivityDensity(searchParams: URLSearchParams) {
  const density = findLiteral(
    activityDensityValues,
    searchParams.get("density"),
  );

  return density === "default" ? undefined : density;
}

function resolveActivityFilter(searchParams: URLSearchParams) {
  const filter = findLiteral(activityFilterValues, searchParams.get("filter"));

  return filter === "all" ? undefined : filter;
}

function getOptionalProposalId(searchParams: URLSearchParams) {
  return extractProposalId(searchParams) ?? undefined;
}

function resolveHomeSearch(searchParams: URLSearchParams): HomeRouteSearch {
  const panel = findLiteral(homePanelValues, searchParams.get("panel"));
  const genericId = searchParams.get("id");

  return {
    invite: getHomeSearchInviteId({ genericId, panel, searchParams }),
    panel,
    request: getHomeSearchRequestId({ genericId, panel, searchParams }),
    view: findLiteral(homeInvitationViewValues, searchParams.get("view")),
  };
}

function getHomeSearchInviteId({
  genericId,
  panel,
  searchParams,
}: {
  genericId: string | null;
  panel: HomeRouteSearch["panel"];
  searchParams: URLSearchParams;
}) {
  return (
    getFirstSearchParam(searchParams, ["invite", "inviteId"]) ??
    getScopedGenericId(genericId, panel, "invitations") ??
    undefined
  );
}

function getHomeSearchRequestId({
  genericId,
  panel,
  searchParams,
}: {
  genericId: string | null;
  panel: HomeRouteSearch["panel"];
  searchParams: URLSearchParams;
}) {
  return (
    getFirstSearchParam(searchParams, ["request", "requestId"]) ??
    getScopedGenericId(genericId, panel, "friends") ??
    undefined
  );
}

function getScopedGenericId(
  genericId: string | null,
  panel: HomeRouteSearch["panel"],
  targetPanel: NonNullable<HomeRouteSearch["panel"]>,
) {
  return panel === targetPanel ? genericId : null;
}

function resolveExploreSearch(
  _searchParams: URLSearchParams,
): ExploreRouteSearch {
  return {};
}

function resolveForgeSearch(searchParams: URLSearchParams): ForgeRouteSearch {
  const mode = searchParams.get("mode");
  const forgeMode = forgeSearchModeValues.find((value) => value === mode);

  return {
    activityId: searchParams.get("activityId") ?? undefined,
    groupId: searchParams.get("groupId") ?? undefined,
    mode: forgeMode,
    open: true,
    step: getValidForgeStep(searchParams),
  };
}

function getValidForgeStep(searchParams: URLSearchParams) {
  const step = Number(searchParams.get("step"));

  return Number.isInteger(step) && step > 0 ? step : undefined;
}

function resolveFromCurrentAppRoute(
  pathname: string,
  searchParams: URLSearchParams,
): NotificationDestination | null {
  const routeResolver = CURRENT_ROUTE_DESTINATION_RESOLVERS[pathname];

  if (routeResolver) {
    return routeResolver(searchParams);
  }

  const userId = matchLegacyUserPath(pathname);

  if (userId) {
    return buildProfileNavigation(userId);
  }

  return null;
}

async function resolveFromLegacyLink(
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

async function resolveEntityDestination(
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

async function resolvePlanGroupDestination(
  planId: string,
  options?: { proposal?: string },
) {
  const groupId = await resolveGroupIdByPlanId(planId);

  if (!groupId) {
    return null;
  }

  return toGroupDestination(groupId, {
    panel: "group",
    plan: planId,
    proposal: options?.proposal,
  });
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

function resolveTypeFallbackDestination(
  notification: Notification,
): NotificationDestination {
  return (
    TYPE_FALLBACK_DESTINATION_RESOLVERS[notification.type]?.(notification) ??
    buildHomeNavigation()
  );
}

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
