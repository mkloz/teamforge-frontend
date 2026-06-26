import { redirect } from "@tanstack/react-router";
import {
  validateGroupPlanDetailSearch,
  validateUserDetailSearch,
} from "@/app/router/route-search-validators";
import { validateActivityRouteSearch } from "@/features/activity/lib/activity-route";
import { validateExploreRouteSearch } from "@/features/explore/lib/explore-route";
import { validateForgeRouteSearch } from "@/features/forge/lib/forge-route";
import { validateHomeRouteSearch } from "@/features/home/lib/home-route";
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
type CanonicalSearchValidator = (search: Record<string, unknown>) => object;
type EditableOnboardingDestination =
  | "/onboarding/personality"
  | "/onboarding/interests";
type PostAuthRedirectPath = ReturnType<typeof getPostAuthRedirectPath>;
type SerializableSearchValue = boolean | number | string;

const STATIC_CANONICAL_SEARCH_VALIDATORS: Record<
  string,
  CanonicalSearchValidator
> = {
  "/activity": validateActivityRouteSearch,
  "/explore": validateExploreRouteSearch,
  "/forge": validateForgeRouteSearch,
  "/home": validateHomeRouteSearch,
  "/profile": () => ({}),
  "/settings": validateSettingsRouteSearch,
};

const DYNAMIC_CANONICAL_SEARCH_VALIDATORS = [
  {
    prefix: "/groups/",
    validate: validateGroupPlanDetailSearch,
  },
  {
    prefix: "/users/",
    validate: validateUserDetailSearch,
  },
] as const;

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

function isSearchValueOmitted(value: unknown) {
  if (
    value === null ||
    value === undefined ||
    value === false ||
    value === ""
  ) {
    return true;
  }

  return false;
}

function isSerializableSearchValue(
  value: unknown,
): value is SerializableSearchValue {
  return (
    typeof value === "boolean" ||
    typeof value === "number" ||
    typeof value === "string"
  );
}

function isSerializableArrayItem(value: unknown): value is number | string {
  return (
    (typeof value === "number" || typeof value === "string") && value !== ""
  );
}

function getCanonicalArraySearchValue(value: unknown[]) {
  const items = value.filter(isSerializableArrayItem);

  if (items.length === 0) {
    return null;
  }

  return items.every((item) => typeof item === "number")
    ? items.join("-")
    : items.join(",");
}

function getCanonicalSearchParamValue(value: unknown) {
  if (isSearchValueOmitted(value)) {
    return null;
  }

  if (Array.isArray(value)) {
    return getCanonicalArraySearchValue(value);
  }

  return isSerializableSearchValue(value) ? String(value) : null;
}

function serializeCanonicalSearchValue(
  params: URLSearchParams,
  key: string,
  value: unknown,
) {
  const serializedValue = getCanonicalSearchParamValue(value);

  if (serializedValue !== null) {
    params.set(key, serializedValue);
  }
}

function serializeCanonicalSearch(search: object) {
  const params = new URLSearchParams();

  Object.entries(search).forEach(([key, value]) => {
    serializeCanonicalSearchValue(params, key, value);
  });

  const serialized = params.toString();

  return serialized.length > 0 ? `?${serialized}` : "";
}

function normalizeSearchEntries(searchStr: string | null | undefined) {
  const params = new URLSearchParams(
    searchStr?.startsWith("?") ? searchStr.slice(1) : (searchStr ?? ""),
  );

  return Array.from(params.entries()).sort(
    ([leftKey, leftValue], [rightKey, rightValue]) =>
      leftKey.localeCompare(rightKey) || leftValue.localeCompare(rightValue),
  );
}

function hasEquivalentSearchParams(
  leftSearchStr: string | null | undefined,
  rightSearchStr: string | null | undefined,
) {
  const leftEntries = normalizeSearchEntries(leftSearchStr);
  const rightEntries = normalizeSearchEntries(rightSearchStr);

  if (leftEntries.length !== rightEntries.length) {
    return false;
  }

  return leftEntries.every(([leftKey, leftValue], index) => {
    const [rightKey, rightValue] = rightEntries[index] ?? [];

    return leftKey === rightKey && leftValue === rightValue;
  });
}

function parseTrueSearchFlag(value: unknown) {
  return value === true || value === "true" ? true : undefined;
}

function validateGlobalAppRouteSearch(search: Record<string, unknown>) {
  return {
    notifications: parseTrueSearchFlag(search.notifications),
  };
}

function isSingleSegmentRouteParam(pathname: string, prefix: string) {
  if (!pathname.startsWith(prefix)) {
    return false;
  }

  const value = pathname.slice(prefix.length);

  return value.length > 0 && !value.includes("/");
}

function getCanonicalRouteSearch(
  pathname: string,
  search: Record<string, unknown>,
): object | null {
  const staticValidator = STATIC_CANONICAL_SEARCH_VALIDATORS[pathname];

  if (staticValidator) {
    return staticValidator(search);
  }

  const dynamicValidator = DYNAMIC_CANONICAL_SEARCH_VALIDATORS.find((route) =>
    isSingleSegmentRouteParam(pathname, route.prefix),
  );

  return dynamicValidator ? dynamicValidator.validate(search) : null;
}

function buildGuardReturnHref(location: RouteLocationLike | undefined) {
  if (!location) {
    return null;
  }

  return buildCanonicalRouteHref(location) ?? buildRouteLocationHref(location);
}

function buildCanonicalRouteHref(location: RouteLocationLike) {
  const rawSearch = parseReturnSearch(location.searchStr);
  const canonicalSearch = getCanonicalRouteSearch(location.pathname, rawSearch);

  if (canonicalSearch === null) {
    return null;
  }

  return `${location.pathname}${serializeCanonicalSearch({
    ...canonicalSearch,
    ...validateGlobalAppRouteSearch(rawSearch),
  })}`;
}

function redirectToCanonicalRouteHref(location: RouteLocationLike) {
  const canonicalHref = buildCanonicalRouteHref(location);
  const currentHref = buildRouteLocationHref(location);
  const canonicalSearchStr = canonicalHref?.slice(location.pathname.length);

  if (
    !canonicalHref ||
    canonicalHref === currentHref ||
    hasEquivalentSearchParams(canonicalSearchStr, location.searchStr)
  ) {
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

function notifySessionRestored(options?: RequireAuthenticatedUserOptions) {
  if (!options?.onSessionRestored) {
    return;
  }

  void Promise.resolve(options.onSessionRestored()).catch(() => null);
}

function resolveSessionFallback(
  sessionState: AuthSessionRestoreState,
  returnHref: string | null,
) {
  if (sessionState === "missing") {
    return redirectToLogin(returnHref);
  }

  if (sessionState === "offline") {
    return getOfflineCurrentUserFallback(returnHref);
  }

  return null;
}

async function resolveAuthenticatedCurrentUser(returnHref: string | null) {
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

async function redirectAuthenticatedUser({
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

async function requireAuthenticatedUser(
  location?: RouteLocationLike,
  options?: RequireAuthenticatedUserOptions,
) {
  const returnHref = buildGuardReturnHref(location);
  const sessionState = await restoreAuthSessionIfNeeded();
  const sessionFallback = resolveSessionFallback(sessionState, returnHref);

  if (sessionFallback) {
    return sessionFallback;
  }

  notifySessionRestored(options);

  return resolveAuthenticatedCurrentUser(returnHref);
}

async function requireCanonicalAppRoute(
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

async function requireCanonicalOnboardingRoute(
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

function getEditableOnboardingRedirectTarget({
  canonicalDestination,
  expectedDestination,
  isEditMode,
}: {
  canonicalDestination: PostAuthRedirectPath;
  expectedDestination: EditableOnboardingDestination;
  isEditMode: boolean;
}) {
  return isEditMode
    ? getEditModeOnboardingRedirectTarget(canonicalDestination)
    : getLinearOnboardingRedirectTarget({
        canonicalDestination,
        expectedDestination,
      });
}

function getEditModeOnboardingRedirectTarget(
  canonicalDestination: PostAuthRedirectPath,
) {
  return canonicalDestination === "/home" ? null : canonicalDestination;
}

function getLinearOnboardingRedirectTarget({
  canonicalDestination,
  expectedDestination,
}: {
  canonicalDestination: PostAuthRedirectPath;
  expectedDestination: EditableOnboardingDestination;
}) {
  if (
    canStayOnEditableOnboardingRoute({
      canonicalDestination,
      expectedDestination,
    })
  ) {
    return null;
  }

  return canonicalDestination;
}

function canStayOnEditableOnboardingRoute({
  canonicalDestination,
  expectedDestination,
}: {
  canonicalDestination: PostAuthRedirectPath;
  expectedDestination: EditableOnboardingDestination;
}) {
  return (
    canonicalDestination === expectedDestination ||
    isReturningFromInterestsToPersonality({
      canonicalDestination,
      expectedDestination,
    })
  );
}

function isReturningFromInterestsToPersonality({
  canonicalDestination,
  expectedDestination,
}: {
  canonicalDestination: PostAuthRedirectPath;
  expectedDestination: EditableOnboardingDestination;
}) {
  return (
    expectedDestination === "/onboarding/personality" &&
    canonicalDestination === "/onboarding/interests"
  );
}

async function requireEditableOnboardingRoute(
  location: RouteLocationLike,
  expectedDestination: EditableOnboardingDestination,
) {
  const currentUser = await requireAuthenticatedUser(location);

  if (!currentUser) {
    return;
  }

  const canonicalDestination = getPostAuthRedirectPath(currentUser);
  const redirectTarget = getEditableOnboardingRedirectTarget({
    canonicalDestination,
    expectedDestination,
    isEditMode: isOnboardingEditMode(location.searchStr),
  });

  if (redirectTarget) {
    throw redirect({ to: redirectTarget });
  }
}

export const routeGuardImplementations = {
  redirectAuthenticatedUser,
  requireCanonicalAppRoute,
  requireCanonicalOnboardingRoute,
  requireEditableOnboardingRoute,
} as const;
