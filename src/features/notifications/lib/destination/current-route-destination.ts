import {
  extractProposalId,
  matchLegacyGroupPath,
  matchLegacyUserPath,
} from "@/features/notifications/lib/notification-intent";
import {
  type ActivityRouteSearch,
  activityDensityValues,
  activityFilterValues,
  activityKindValues,
  activityPanelValues,
  buildActivityNavigation,
} from "@/shared/navigation/activity-navigation";
import {
  buildExploreNavigation,
  type ExploreRouteSearch,
  validateExploreRouteSearch,
} from "@/shared/navigation/explore-navigation";
import {
  buildForgeNavigation,
  type ForgeRouteSearch,
  validateForgeRouteSearch,
} from "@/shared/navigation/forge-navigation";
import {
  buildGroupPlanDetailNavigation,
  validateGroupPlanDetailSearch,
} from "@/shared/navigation/group-navigation";
import {
  buildHomeNavigation,
  type HomeRouteSearch,
  homeInvitationViewValues,
  homePanelValues,
} from "@/shared/navigation/home-navigation";
import {
  buildProfileNavigation,
  validateUserDetailSearch,
} from "@/shared/navigation/profile-navigation";
import { getSearchRecord } from "@/shared/navigation/search-record";
import {
  buildSettingsNavigation,
  normalizeSettingsSection,
} from "@/shared/navigation/settings-navigation";
import type {
  CurrentRouteDestinationResolver,
  NotificationDestination,
} from "./notification-destination.types";
import {
  extractMessageId,
  extractPlanId,
  findLiteral,
  getFirstSearchParam,
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
const GROUP_PLAN_DETAIL_SEARCH_KEYS = new Set([
  "plan",
  "proposal",
  "returnTo",
  "source",
]);

export function resolveFromCurrentAppRoute(
  pathname: string,
  searchParams: URLSearchParams,
): NotificationDestination | null {
  const routeResolver = CURRENT_ROUTE_DESTINATION_RESOLVERS[pathname];

  if (routeResolver) {
    return routeResolver(searchParams);
  }

  const groupId = matchLegacyGroupPath(pathname);

  if (
    groupId &&
    hasOnlySearchKeys(searchParams, GROUP_PLAN_DETAIL_SEARCH_KEYS)
  ) {
    return buildGroupPlanDetailNavigation(
      groupId,
      validateGroupPlanDetailSearch(getSearchRecord(searchParams)),
    );
  }

  const userId = matchLegacyUserPath(pathname);

  if (userId) {
    return buildProfileNavigation(
      userId,
      validateUserDetailSearch(getSearchRecord(searchParams)),
    );
  }

  return null;
}

function hasOnlySearchKeys(
  searchParams: URLSearchParams,
  allowedKeys: ReadonlySet<string>,
) {
  return Array.from(searchParams.keys()).every((key) => allowedKeys.has(key));
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
  searchParams: URLSearchParams,
): ExploreRouteSearch {
  return validateExploreRouteSearch(getSearchRecord(searchParams));
}

function resolveForgeSearch(searchParams: URLSearchParams): ForgeRouteSearch {
  return validateForgeRouteSearch(getSearchRecord(searchParams));
}
