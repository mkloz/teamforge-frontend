import {
  type ActivityRouteSearch,
  activityDensityValues,
  activityFilterValues,
  activityKindValues,
  activityPanelValues,
  buildActivityDmNavigation,
  buildActivityGroupNavigation,
  buildActivityNavigation,
} from "@/features/activity/lib/activity-route";
import {
  buildExploreNavigation,
  type ExploreRouteSearch,
} from "@/features/explore/lib/explore-route";
import {
  buildForgeNavigation,
  type ForgeRouteSearch,
  forgeSearchModeValues,
} from "@/features/forge/lib/forge-route";
import {
  buildGroupPlanDetailNavigation,
  type GroupPlanDetailRouteSearch,
} from "@/features/group-plan-detail/lib/group-plan-detail-route";
import {
  buildHomeNavigation,
  type HomeRouteSearch,
  homeInvitationViewValues,
  homePanelValues,
} from "@/features/home/lib/home-route";
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
  matchLegacyUserPath,
  resolveFriendRequestIntent,
  resolveInviteIntent,
} from "@/features/notifications/lib/notification-intent";
import {
  buildProfileNavigation,
  type ProfileNavigation,
} from "@/features/profile/lib/profile-route";
import {
  buildSettingsNavigation,
  normalizeSettingsSection,
  type SettingsSection,
} from "@/features/settings/lib/settings-route";
import { apiClient } from "@/shared/api/api";
import {
  createPaginatedSchema,
  type GroupApi,
  groupApiSchema,
  type Notification,
} from "@/shared/schemas";

const paginatedGroupsSchema = createPaginatedSchema(groupApiSchema);
const GROUP_LOOKUP_PAGE_LIMIT = 100;
const MAX_GROUP_LOOKUP_PAGES = 10;
const planGroupCache = new Map<string, string>();
const chatGroupCache = new Map<string, string>();

interface LegacyLinkContext {
  messageIdFromSearch: string | undefined;
  notification: Notification;
  pathname: string;
  planIdFromSearch: string | undefined;
  proposalId: string | null;
  searchParams: URLSearchParams;
}

interface ParsedNotificationLink {
  pathname: string;
  searchParams: URLSearchParams;
}

export type NotificationDestination =
  | { to: "/activity"; search?: ActivityRouteSearch }
  | { to: "/home"; search?: HomeRouteSearch }
  | { to: "/explore"; search?: ExploreRouteSearch }
  | { to: "/forge"; search?: ForgeRouteSearch }
  | ProfileNavigation
  | {
      to: "/groups/$groupId";
      params: { groupId: string };
      search?: GroupPlanDetailRouteSearch;
    }
  | { to: "/settings"; search?: { section?: SettingsSection } };

type CurrentRouteDestinationResolver = (
  searchParams: URLSearchParams,
) => NotificationDestination;

type NotificationEntityResolver = (
  notification: Notification,
  entityId: string,
) => Promise<NotificationDestination | null> | NotificationDestination | null;

type NotificationFallbackResolver = (
  notification: Notification,
) => NotificationDestination;

type LegacyDestinationResolver = (
  linkContext: LegacyLinkContext,
) => Promise<NotificationDestination | null> | NotificationDestination | null;

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

function parseNotificationLink(link: string | null) {
  if (!link) {
    return null;
  }

  return (
    parseAbsoluteNotificationLink(link) ?? parseRelativeNotificationLink(link)
  );
}

function parseAbsoluteNotificationLink(
  link: string,
): ParsedNotificationLink | null {
  try {
    const parsedUrl = new URL(link);

    return {
      pathname: parsedUrl.pathname,
      searchParams: parsedUrl.searchParams,
    } satisfies ParsedNotificationLink;
  } catch {
    return null;
  }
}

function parseRelativeNotificationLink(
  link: string,
): ParsedNotificationLink | null {
  if (!isRelativeAppLink(link)) {
    return null;
  }

  const { pathname, search } = splitRelativeNotificationLink(link);

  return {
    pathname,
    searchParams: new URLSearchParams(search),
  } satisfies ParsedNotificationLink;
}

function isRelativeAppLink(link: string) {
  return link.startsWith("/") && !link.startsWith("//");
}

function splitRelativeNotificationLink(link: string) {
  const linkWithoutHash = stripNotificationLinkHash(link);
  const { pathname, search } = splitNotificationPathAndSearch(linkWithoutHash);

  return {
    pathname: pathname || "/",
    search,
  };
}

function stripNotificationLinkHash(link: string) {
  const hashIndex = link.indexOf("#");

  return hashIndex >= 0 ? link.slice(0, hashIndex) : link;
}

function splitNotificationPathAndSearch(link: string) {
  const searchIndex = link.indexOf("?");

  return {
    pathname: searchIndex >= 0 ? link.slice(0, searchIndex) : link,
    search: searchIndex >= 0 ? link.slice(searchIndex + 1) : "",
  };
}

function normalizeNotificationPathname(pathname: string) {
  return pathname.replace(/^\/api(?:\/v\d+)?(?=\/)/, "");
}

function extractProposalIdFromLink(link: string | null) {
  const parsedLink = parseNotificationLink(link);

  if (!parsedLink) {
    return undefined;
  }

  const proposalId = extractProposalId(parsedLink.searchParams);

  return proposalId ?? undefined;
}

function extractPlanId(searchParams: URLSearchParams) {
  return getFirstSearchParam(searchParams, ["plan", "planId", "currentPlanId"]);
}

function extractMessageId(searchParams: URLSearchParams) {
  return getFirstSearchParam(searchParams, ["message", "messageId"]);
}

function extractChatId(searchParams: URLSearchParams) {
  return getFirstSearchParam(searchParams, ["chat", "chatId"]);
}

function extractGroupId(searchParams: URLSearchParams) {
  return getFirstSearchParam(searchParams, ["group", "groupId"]);
}

function findLiteral<T extends readonly string[]>(
  values: T,
  value: string | null,
): T[number] | undefined {
  return values.find((candidate) => candidate === value);
}

function getFirstSearchParam(
  searchParams: URLSearchParams,
  keys: readonly string[],
) {
  for (const key of keys) {
    const value = searchParams.get(key);

    if (value !== null) {
      return value;
    }
  }

  return undefined;
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

async function resolveGroupIdByPlanId(planId: string) {
  const cachedGroupId = planGroupCache.get(planId);

  if (cachedGroupId) {
    return cachedGroupId;
  }

  const groupId = await findGroupIdByPredicate(
    (group) => group.plan?.id === planId,
  );

  if (groupId) {
    planGroupCache.set(planId, groupId);
  }

  return groupId;
}

async function resolveGroupIdByChatId(chatId: string) {
  const cachedGroupId = chatGroupCache.get(chatId);

  if (cachedGroupId) {
    return cachedGroupId;
  }

  const groupId = await findGroupIdByPredicate(
    (group) => group.chat?.id === chatId,
  );

  if (groupId) {
    chatGroupCache.set(chatId, groupId);
  }

  return groupId;
}

async function findGroupIdByPredicate(predicate: (group: GroupApi) => boolean) {
  try {
    return await findGroupIdAcrossLookupPages(predicate);
  } catch {
    return null;
  }
}

async function findGroupIdAcrossLookupPages(
  predicate: (group: GroupApi) => boolean,
) {
  const firstPage = await getGroupLookupPage(1);
  const firstPageGroupId = findGroupIdInLookupPage(firstPage.items, predicate);

  if (firstPageGroupId) {
    return firstPageGroupId;
  }

  return findGroupIdInRemainingLookupPages(firstPage, predicate);
}

async function findGroupIdInRemainingLookupPages(
  firstPage: Awaited<ReturnType<typeof getGroupLookupPage>>,
  predicate: (group: GroupApi) => boolean,
) {
  const totalPages = Math.min(
    MAX_GROUP_LOOKUP_PAGES,
    firstPage.meta.totalPages,
  );

  if (!shouldReadRemainingGroupLookupPages(firstPage, totalPages)) {
    return null;
  }

  const remainingPages = getRemainingGroupLookupPages(totalPages);
  const remainingResults = await Promise.all(
    remainingPages.map((page) => getGroupLookupPage(page)),
  );

  return findGroupIdInLookupResults(remainingResults, predicate);
}

function shouldReadRemainingGroupLookupPages(
  firstPage: Awaited<ReturnType<typeof getGroupLookupPage>>,
  totalPages: number,
) {
  return firstPage.items.length > 0 && totalPages > 1;
}

function findGroupIdInLookupResults(
  results: Awaited<ReturnType<typeof getGroupLookupPage>>[],
  predicate: (group: GroupApi) => boolean,
) {
  for (const result of results) {
    const groupId = findGroupIdInLookupPage(result.items, predicate);

    if (groupId) {
      return groupId;
    }
  }

  return null;
}

function findGroupIdInLookupPage(
  groups: GroupApi[],
  predicate: (group: GroupApi) => boolean,
) {
  return groups.find(predicate)?.id;
}

function getRemainingGroupLookupPages(totalPages: number) {
  return Array.from({ length: totalPages - 1 }, (_, index) => index + 2);
}

async function getGroupLookupPage(page: number) {
  const response = await apiClient
    .get("groups", {
      searchParams: {
        limit: GROUP_LOOKUP_PAGE_LIMIT,
        page,
      },
    })
    .json<unknown>();

  return paginatedGroupsSchema.parse(response);
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
