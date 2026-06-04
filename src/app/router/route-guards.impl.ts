import { redirect } from "@tanstack/react-router";

import { validateActivityRouteSearch } from "@/features/activity/lib/activity-route";
import { validateExploreRouteSearch } from "@/features/explore/lib/explore-route";
import { validateForgeRouteSearch } from "@/features/forge/lib/forge-route";
import {
  type GroupPlanDetailRouteSearch,
  type GroupPlanDetailSource,
  groupPlanDetailSourceValues,
} from "@/features/group-plan-detail/lib/group-plan-detail-route";
import { validateHomeRouteSearch } from "@/features/home/lib/home-route";
import {
  type UserDetailIntent,
  type UserDetailRouteSearch,
  userDetailIntentValues,
} from "@/features/profile/lib/profile-route";
import { validateSettingsRouteSearch } from "@/features/settings/lib/settings-route";
import { refreshAuthSession } from "@/shared/api/api";
import { isApiNetworkError } from "@/shared/api/api-network-error";
import { authSession } from "@/shared/api/auth-session";
import { getCachedCurrentUser } from "@/shared/api/current-user-cache";
import {
  buildAuthRouteNavigation,
  buildPostAuthRedirectNavigation,
  buildRouteLocationHref,
  parseAuthReturnSearch,
} from "@/shared/lib/auth-route";
import { getPostAuthRedirectPath } from "@/shared/lib/post-auth-route";

interface RouteLocationLike {
  pathname: string;
  searchStr: string;
}

interface PublicAuthRouteLoadContext {
  location: {
    searchStr: string;
  };
}

interface RequireAuthenticatedUserOptions {
  onSessionRestored?: () => void | Promise<void>;
}

type AuthSessionRestoreState = "authenticated" | "missing" | "offline";

async function restoreAuthSessionIfNeeded(): Promise<AuthSessionRestoreState> {
  if (!authSession.hasTokens()) {
    try {
      await refreshAuthSession();
    } catch (error) {
      return isApiNetworkError(error) ? "offline" : "missing";
    }
  }

  return authSession.hasTokens() ? "authenticated" : "missing";
}

async function resolveCurrentUser() {
  const cachedCurrentUser = getCachedCurrentUser();

  if (cachedCurrentUser) {
    return cachedCurrentUser;
  }

  const { ensureCurrentUser } = await import("@/shared/api/current-user-query");

  return ensureCurrentUser();
}

function parseReturnSearch(searchStr: string | null | undefined) {
  const params = new URLSearchParams(
    searchStr?.startsWith("?") ? searchStr.slice(1) : (searchStr ?? ""),
  );
  const search: Record<string, unknown> = {};

  params.forEach((value, key) => {
    const existingValue = search[key];

    if (existingValue === undefined) {
      search[key] = value;
      return;
    }

    search[key] = Array.isArray(existingValue)
      ? [...existingValue, value]
      : [existingValue, value];
  });

  return search;
}

function serializeCanonicalSearchValue(
  params: URLSearchParams,
  key: string,
  value: unknown,
) {
  if (
    value === null ||
    value === undefined ||
    value === false ||
    value === ""
  ) {
    return;
  }

  if (Array.isArray(value)) {
    const items = value.filter(
      (item): item is number | string =>
        (typeof item === "number" || typeof item === "string") && item !== "",
    );

    if (items.length === 0) {
      return;
    }

    params.set(
      key,
      items.every((item) => typeof item === "number")
        ? items.join("-")
        : items.join(","),
    );
    return;
  }

  if (
    typeof value !== "boolean" &&
    typeof value !== "number" &&
    typeof value !== "string"
  ) {
    return;
  }

  params.set(key, String(value));
}

function serializeCanonicalSearch(search: object) {
  const params = new URLSearchParams();

  Object.entries(search).forEach(([key, value]) => {
    serializeCanonicalSearchValue(params, key, value);
  });

  const serialized = params.toString();

  return serialized.length > 0 ? `?${serialized}` : "";
}

function parseOptionalSearchString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function isGroupPlanDetailSource(
  value: unknown,
): value is GroupPlanDetailSource {
  return (
    typeof value === "string" &&
    groupPlanDetailSourceValues.some((source) => source === value)
  );
}

function validateGroupPlanDetailReturnSearch(
  search: Record<string, unknown>,
): GroupPlanDetailRouteSearch {
  return {
    plan: parseOptionalSearchString(search.plan),
    proposal: parseOptionalSearchString(search.proposal),
    returnTo: parseOptionalSearchString(search.returnTo),
    source: isGroupPlanDetailSource(search.source) ? search.source : undefined,
  };
}

function isUserDetailIntent(value: unknown): value is UserDetailIntent {
  return (
    typeof value === "string" &&
    userDetailIntentValues.some((intent) => intent === value)
  );
}

function validateUserDetailReturnSearch(
  search: Record<string, unknown>,
): UserDetailRouteSearch {
  return {
    intent: isUserDetailIntent(search.intent) ? search.intent : undefined,
  };
}

function isSingleSegmentRouteParam(pathname: string, prefix: string) {
  const value = pathname.slice(prefix.length);

  return value.length > 0 && !value.includes("/");
}

function getCanonicalRouteSearch(
  pathname: string,
  search: Record<string, unknown>,
): object | null {
  switch (pathname) {
    case "/activity":
      return validateActivityRouteSearch(search);
    case "/explore":
      return validateExploreRouteSearch(search);
    case "/forge":
      return validateForgeRouteSearch(search);
    case "/home":
      return validateHomeRouteSearch(search);
    case "/profile":
      return {};
    case "/settings":
      return validateSettingsRouteSearch(search);
    default:
      break;
  }

  if (
    pathname.startsWith("/groups/") &&
    isSingleSegmentRouteParam(pathname, "/groups/")
  ) {
    return validateGroupPlanDetailReturnSearch(search);
  }

  if (
    pathname.startsWith("/users/") &&
    isSingleSegmentRouteParam(pathname, "/users/")
  ) {
    return validateUserDetailReturnSearch(search);
  }

  return null;
}

function buildGuardReturnHref(location: RouteLocationLike | undefined) {
  if (!location) {
    return null;
  }

  return buildCanonicalRouteHref(location) ?? buildRouteLocationHref(location);
}

function buildCanonicalRouteHref(location: RouteLocationLike) {
  const canonicalSearch = getCanonicalRouteSearch(
    location.pathname,
    parseReturnSearch(location.searchStr),
  );

  if (canonicalSearch === null) {
    return null;
  }

  return `${location.pathname}${serializeCanonicalSearch(canonicalSearch)}`;
}

function redirectToCanonicalRouteHref(location: RouteLocationLike) {
  const canonicalHref = buildCanonicalRouteHref(location);
  const currentHref = buildRouteLocationHref(location);

  if (!canonicalHref || canonicalHref === currentHref) {
    return;
  }

  throw redirect({
    href: canonicalHref,
    replace: true,
  });
}

function redirectToLogin(returnHref: string | null): never {
  throw redirect(buildAuthRouteNavigation("/auth/login", returnHref));
}

function getOfflineCurrentUserFallback(returnHref: string | null) {
  const cachedCurrentUser = getCachedCurrentUser();

  if (!cachedCurrentUser) {
    return redirectToLogin(returnHref);
  }

  return cachedCurrentUser;
}

function isOnboardingEditMode(searchStr: string) {
  return new URLSearchParams(searchStr).get("mode") === "edit";
}

export async function redirectAuthenticatedUser({
  location,
}: PublicAuthRouteLoadContext) {
  if (!authSession.hasTokens()) {
    return;
  }

  const hasSession = await restoreAuthSessionIfNeeded();

  if (hasSession !== "authenticated") {
    return;
  }

  const currentUser = await resolveCurrentUser().catch(() => null);

  if (!currentUser) {
    return;
  }

  const { returnTo } = parseAuthReturnSearch(location.searchStr);

  throw redirect(buildPostAuthRedirectNavigation(currentUser, returnTo));
}

export async function requireAuthenticatedUser(
  location?: RouteLocationLike,
  options?: RequireAuthenticatedUserOptions,
) {
  const returnHref = buildGuardReturnHref(location);
  const sessionState = await restoreAuthSessionIfNeeded();

  if (sessionState === "missing") {
    return redirectToLogin(returnHref);
  }

  if (sessionState === "offline") {
    return getOfflineCurrentUserFallback(returnHref);
  }

  if (options?.onSessionRestored) {
    void Promise.resolve(options.onSessionRestored()).catch(() => null);
  }

  try {
    const currentUser = await resolveCurrentUser();

    if (!currentUser) {
      return redirectToLogin(returnHref);
    }

    return currentUser;
  } catch (error) {
    if (isApiNetworkError(error)) {
      return getOfflineCurrentUserFallback(returnHref);
    }

    return redirectToLogin(returnHref);
  }
}

export async function requireCanonicalAppRoute(
  location: RouteLocationLike,
  options?: RequireAuthenticatedUserOptions,
) {
  const currentUser = await requireAuthenticatedUser(location, options);

  if (!currentUser) {
    return;
  }

  const canonicalDestination = getPostAuthRedirectPath(currentUser);

  if (canonicalDestination !== "/home") {
    throw redirect({ to: canonicalDestination });
  }

  redirectToCanonicalRouteHref(location);
}

export async function requireCanonicalOnboardingRoute(
  location: RouteLocationLike,
  expectedDestination:
    | "/onboarding/profile"
    | "/onboarding/personality"
    | "/onboarding/interests",
) {
  const currentUser = await requireAuthenticatedUser(location);

  if (!currentUser) {
    return;
  }

  const canonicalDestination = getPostAuthRedirectPath(currentUser);

  if (canonicalDestination !== expectedDestination) {
    throw redirect({ to: canonicalDestination });
  }
}

export async function requireEditableOnboardingRoute(
  location: RouteLocationLike,
  expectedDestination: "/onboarding/personality" | "/onboarding/interests",
) {
  const currentUser = await requireAuthenticatedUser(location);

  if (!currentUser) {
    return;
  }

  const canonicalDestination = getPostAuthRedirectPath(currentUser);

  if (isOnboardingEditMode(location.searchStr)) {
    if (canonicalDestination !== "/home") {
      throw redirect({ to: canonicalDestination });
    }

    return;
  }

  if (canonicalDestination !== expectedDestination) {
    const isReturningFromInterestsToPersonality =
      expectedDestination === "/onboarding/personality" &&
      canonicalDestination === "/onboarding/interests";

    if (isReturningFromInterestsToPersonality) {
      return;
    }

    throw redirect({ to: canonicalDestination });
  }
}
