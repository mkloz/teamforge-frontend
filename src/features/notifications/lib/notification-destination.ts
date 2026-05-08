import {
  type ActivityRouteSearch,
  buildActivityDmNavigation,
  buildActivityGroupNavigation,
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
  buildHomeNavigation,
  type HomeRouteSearch,
} from "@/features/home/lib/home-route";
import {
  extractProposalId,
  matchLegacyChatPath,
  matchLegacyGroupPath,
  matchLegacyGroupRatingPath,
  matchLegacyPlanPath,
  matchLegacyPlanProposalPath,
  resolveFriendRequestIntent,
  resolveInviteIntent,
  shouldOpenGroupPanelForNotificationType,
} from "@/features/notifications/lib/notification-intent";
import {
  buildSettingsNavigation,
  type SettingsSection,
} from "@/features/settings/lib/settings-route";
import { apiClient } from "@/shared/api/api";
import {
  createPaginatedSchema,
  groupApiSchema,
  type Notification,
} from "@/shared/schemas";

const paginatedGroupsSchema = createPaginatedSchema(groupApiSchema);
const planGroupCache = new Map<string, string>();

export type NotificationDestination =
  | { to: "/activity"; search?: ActivityRouteSearch }
  | { to: "/home"; search?: HomeRouteSearch }
  | { to: "/explore"; search?: ExploreRouteSearch }
  | { to: "/forge"; search?: ForgeRouteSearch }
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
  return buildActivityGroupNavigation(groupId, options);
}

function extractProposalIdFromLink(link: string | null) {
  if (!link) {
    return undefined;
  }

  const parsedLink = new URL(
    link.startsWith("/") ? link : `/${link}`,
    "https://teamforge.local",
  );
  const proposalId = extractProposalId(parsedLink.searchParams);

  return proposalId ?? undefined;
}

function toDirectMessageDestination(
  chatId: string,
  messageId?: string,
): NotificationDestination {
  return buildActivityDmNavigation(chatId, {
    message: messageId,
  });
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

async function resolveGroupIdByPlanId(planId: string) {
  const cachedGroupId = planGroupCache.get(planId);

  if (cachedGroupId) {
    return cachedGroupId;
  }

  const response = await apiClient
    .get("groups", {
      searchParams: {
        limit: 100,
      },
    })
    .json<unknown>();
  const groups = paginatedGroupsSchema.parse(response).items;
  const groupId = groups.find((group) => group.plan?.id === planId)?.id ?? null;

  if (groupId) {
    planGroupCache.set(planId, groupId);
  }

  return groupId;
}

async function resolveFromLegacyLink(
  notification: Notification,
): Promise<NotificationDestination | null> {
  const link = notification.link;

  if (!link) {
    return null;
  }

  const normalizedLink = link.startsWith("/") ? link : `/${link}`;
  const parsedLink = new URL(normalizedLink, "https://teamforge.local");
  const pathname = parsedLink.pathname;
  const proposalId = extractProposalId(parsedLink.searchParams);

  if (pathname === "/forge") {
    return buildForgeNavigation(resolveForgeSearch(parsedLink.searchParams));
  }

  const groupId = matchLegacyGroupPath(pathname);

  if (groupId) {
    return toGroupDestination(groupId, {
      panel: shouldOpenGroupPanelForNotificationType(notification.type)
        ? "group"
        : undefined,
      proposal:
        notification.type === "PLAN_PROPOSAL"
          ? (proposalId ?? undefined)
          : undefined,
    });
  }

  const chatId = matchLegacyChatPath(pathname);

  if (chatId) {
    return toDirectMessageDestination(
      chatId,
      notification.entityType === "MESSAGE"
        ? (notification.entityId ?? undefined)
        : undefined,
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
      panel: shouldOpenGroupPanelForNotificationType(notification.type)
        ? "group"
        : undefined,
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

  switch (notification.type) {
    case "NEW_MESSAGE":
    case "MESSAGE_MENTION":
      return { to: "/activity" };
    case "FRIEND_REQUEST":
      return buildHomeNavigation({
        panel: "friends",
        request: notification.entityId ?? undefined,
      });
    case "FRIEND_ACCEPTED":
      return buildExploreNavigation();
    case "ACCOUNT_SECURITY":
      return buildSettingsNavigation("security");
    default:
      return buildHomeNavigation();
  }
}
