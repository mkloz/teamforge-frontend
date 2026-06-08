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
    return buildActivityGroupNavigation(groupId, {
      panel: "group",
      message: options.message,
    });
  }

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

  try {
    return new URL(link, "https://teamforge.local");
  } catch {
    return null;
  }
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
  return (
    searchParams.get("plan") ??
    searchParams.get("planId") ??
    searchParams.get("currentPlanId") ??
    undefined
  );
}

function extractMessageId(searchParams: URLSearchParams) {
  return (
    searchParams.get("message") ?? searchParams.get("messageId") ?? undefined
  );
}

function extractChatId(searchParams: URLSearchParams) {
  return searchParams.get("chat") ?? searchParams.get("chatId") ?? undefined;
}

function extractGroupId(searchParams: URLSearchParams) {
  return searchParams.get("group") ?? searchParams.get("groupId") ?? undefined;
}

function findLiteral<T extends readonly string[]>(
  values: T,
  value: string | null,
): T[number] | undefined {
  return values.find((candidate) => candidate === value);
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
  const filter = findLiteral(activityFilterValues, searchParams.get("filter"));
  const density = findLiteral(
    activityDensityValues,
    searchParams.get("density"),
  );
  const kind = findLiteral(activityKindValues, searchParams.get("kind"));
  const panel = findLiteral(activityPanelValues, searchParams.get("panel"));

  return {
    density: density === "default" ? undefined : density,
    filter: filter === "all" ? undefined : filter,
    id: searchParams.get("id") ?? undefined,
    kind,
    message: extractMessageId(searchParams),
    panel,
    plan: extractPlanId(searchParams),
    proposal: extractProposalId(searchParams) ?? undefined,
    q: searchParams.get("q") ?? undefined,
  };
}

function resolveHomeSearch(searchParams: URLSearchParams): HomeRouteSearch {
  const panel = findLiteral(homePanelValues, searchParams.get("panel"));
  const genericId = searchParams.get("id");

  return {
    invite:
      searchParams.get("invite") ??
      searchParams.get("inviteId") ??
      (panel === "invitations" ? genericId : null) ??
      undefined,
    panel,
    request:
      searchParams.get("request") ??
      searchParams.get("requestId") ??
      (panel === "friends" ? genericId : null) ??
      undefined,
    view: findLiteral(homeInvitationViewValues, searchParams.get("view")),
  };
}

function resolveExploreSearch(
  _searchParams: URLSearchParams,
): ExploreRouteSearch {
  return {};
}

function resolveForgeSearch(searchParams: URLSearchParams): ForgeRouteSearch {
  const step = Number(searchParams.get("step"));
  const mode = searchParams.get("mode");
  const forgeMode = forgeSearchModeValues.find((value) => value === mode);

  return {
    activityId: searchParams.get("activityId") ?? undefined,
    groupId: searchParams.get("groupId") ?? undefined,
    mode: forgeMode,
    open: true,
    step: Number.isInteger(step) && step > 0 ? step : undefined,
  };
}

function resolveFromCurrentAppRoute(
  pathname: string,
  searchParams: URLSearchParams,
): NotificationDestination | null {
  if (pathname === "/activity") {
    return buildActivityNavigation(resolveActivitySearch(searchParams));
  }

  if (pathname === "/home") {
    return buildHomeNavigation(resolveHomeSearch(searchParams));
  }

  if (pathname === "/explore") {
    return buildExploreNavigation(resolveExploreSearch(searchParams));
  }

  if (pathname === "/forge") {
    return buildForgeNavigation(resolveForgeSearch(searchParams));
  }

  if (pathname === "/profile") {
    return buildProfileNavigation();
  }

  if (pathname === "/settings") {
    return buildSettingsNavigation(
      normalizeSettingsSection(searchParams.get("section")),
    );
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
    const firstPage = await getGroupLookupPage(1);
    const firstPageGroupId = firstPage.items.find(predicate)?.id;

    if (firstPageGroupId) {
      return firstPageGroupId;
    }

    const totalPages = Math.min(
      MAX_GROUP_LOOKUP_PAGES,
      firstPage.meta.totalPages,
    );

    if (firstPage.items.length === 0 || totalPages <= 1) {
      return null;
    }

    const remainingPages = Array.from(
      { length: totalPages - 1 },
      (_, index) => index + 2,
    );
    const remainingResults = await Promise.all(
      remainingPages.map((page) => getGroupLookupPage(page)),
    );

    for (const result of remainingResults) {
      const groupId = result.items.find(predicate)?.id;

      if (groupId) {
        return groupId;
      }
    }
  } catch {
    return null;
  }

  return null;
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
  const link = notification.link;

  if (!link) {
    return null;
  }

  const parsedLink = parseNotificationLink(link);

  if (!parsedLink) {
    return null;
  }

  const pathname = normalizeNotificationPathname(parsedLink.pathname);
  const proposalId = extractProposalId(parsedLink.searchParams);
  const planIdFromSearch = extractPlanId(parsedLink.searchParams);
  const messageIdFromSearch = extractMessageId(parsedLink.searchParams);

  const currentAppRoute = resolveFromCurrentAppRoute(
    pathname,
    parsedLink.searchParams,
  );

  if (currentAppRoute) {
    return currentAppRoute;
  }

  const groupPlanMatch = matchLegacyGroupPlanPath(pathname);

  if (groupPlanMatch) {
    return toGroupDestination(groupPlanMatch.groupId, {
      panel: "group",
      plan: groupPlanMatch.planId ?? planIdFromSearch,
      proposal: proposalId ?? undefined,
    });
  }

  const groupId =
    extractGroupId(parsedLink.searchParams) ??
    matchLegacyGroupPath(pathname) ??
    matchLegacyExploreGroupPath(pathname);

  if (groupId) {
    return toGroupDestination(groupId, {
      panel: "group",
      plan: planIdFromSearch,
      proposal: proposalId ?? undefined,
    });
  }

  const chatMessageMatch = matchLegacyChatMessagePath(pathname);

  if (chatMessageMatch) {
    return toChatDestination(
      chatMessageMatch.chatId,
      chatMessageMatch.messageId,
    );
  }

  const chatId =
    extractChatId(parsedLink.searchParams) ?? matchLegacyChatPath(pathname);

  if (chatId) {
    return toChatDestination(
      chatId,
      messageIdFromSearch ??
        (notification.entityType === "MESSAGE"
          ? (notification.entityId ?? undefined)
          : undefined),
    );
  }

  const planProposalMatch = matchLegacyPlanProposalPath(pathname);

  if (planProposalMatch) {
    const planId = planProposalMatch.planId;
    const proposalFromPath = planProposalMatch.proposalId ?? proposalId;
    const resolvedGroupId = await resolveGroupIdByPlanId(planId);

    if (resolvedGroupId) {
      return toGroupDestination(resolvedGroupId, {
        panel: "group",
        plan: planId,
        proposal: proposalFromPath ?? undefined,
      });
    }
  }

  const planId = matchLegacyPlanPath(pathname);

  if (planId) {
    const resolvedGroupId = await resolveGroupIdByPlanId(planId);

    if (resolvedGroupId) {
      return toGroupDestination(resolvedGroupId, {
        panel: "group",
        plan: planId,
        proposal:
          notification.type === "PLAN_PROPOSAL"
            ? (proposalId ?? undefined)
            : undefined,
      });
    }
  }

  const groupRatingId = matchLegacyGroupRatingPath(pathname);

  if (groupRatingId) {
    return toGroupDestination(groupRatingId, {
      panel: "group",
    });
  }

  const inviteIntent = resolveInviteIntent(pathname, parsedLink.searchParams);

  if (inviteIntent) {
    if (notification.entityType === "GROUP" && notification.entityId) {
      return toGroupDestination(notification.entityId, {
        panel: "group",
      });
    }

    return buildHomeNavigation(inviteIntent);
  }

  const friendRequestIntent = resolveFriendRequestIntent(
    pathname,
    parsedLink.searchParams,
  );

  if (friendRequestIntent) {
    return buildHomeNavigation(friendRequestIntent);
  }

  return null;
}

export async function resolveNotificationDestination(
  notification: Notification,
): Promise<NotificationDestination> {
  const fromLink = await resolveFromLegacyLink(notification);

  if (fromLink) {
    return fromLink;
  }

  if (notification.entityType === "GROUP" && notification.entityId) {
    return toGroupDestination(notification.entityId, {
      panel: "group",
    });
  }

  if (notification.entityType === "PLAN" && notification.entityId) {
    const groupId = await resolveGroupIdByPlanId(notification.entityId);

    if (groupId) {
      return toGroupDestination(groupId, {
        panel: "group",
        plan: notification.entityId,
        proposal:
          notification.type === "PLAN_PROPOSAL"
            ? extractProposalIdFromLink(notification.link)
            : undefined,
      });
    }
  }

  if (notification.entityType === "ACTIVITY" && notification.entityId) {
    return buildForgeNavigation({
      activityId: notification.entityId,
      open: true,
    });
  }

  if (notification.entityType === "INVITE" && notification.entityId) {
    return buildHomeNavigation({
      invite: notification.entityId,
      panel: "invitations",
      view: "received",
    });
  }

  if (notification.entityType === "USER" && notification.entityId) {
    if (notification.type === "FRIEND_REQUEST") {
      return buildHomeNavigation({
        panel: "friends",
        request: notification.entityId,
      });
    }

    return buildProfileNavigation(notification.entityId);
  }

  switch (notification.type) {
    case "NEW_MESSAGE":
    case "MESSAGE_MENTION":
      return buildActivityNavigation({ filter: "unread" });
    case "FRIEND_REQUEST":
      return buildHomeNavigation({
        panel: "friends",
        request: notification.entityId ?? undefined,
      });
    case "FRIEND_ACCEPTED":
      return buildProfileNavigation();
    case "ACCOUNT_SECURITY":
      return buildSettingsNavigation("security");
    default:
      return buildHomeNavigation();
  }
}
