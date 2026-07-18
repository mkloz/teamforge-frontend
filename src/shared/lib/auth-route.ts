import { useRouterState } from "@tanstack/react-router";
import { normalizeRouteSearch } from "@/shared/lib/route-search";
import type { User } from "@/shared/schemas";

import { getPostAuthRedirectPath } from "./post-auth-route";

const authReturnTargets = [
  "/",
  "/download",
  "/home",
  "/explore",
  "/activity",
  "/profile",
  "/settings",
  "/forge",
  "/admin",
  "/admin/moderation",
  "/admin/moderation/intake",
  "/admin/moderation/workers",
  "/admin/moderation/operations",
  "/admin/moderation/settings",
  "/onboarding/profile",
  "/onboarding/personality",
  "/onboarding/interests",
] as const;

type StaticAuthReturnTarget = (typeof authReturnTargets)[number];
type DynamicAuthReturnTarget =
  | `/groups/${string}`
  | `/users/${string}`
  | `/admin/moderation/cases/${string}`;
type AuthEntryRoute =
  | "/auth/login"
  | "/auth/register"
  | "/auth/forgot-password";
type AuthReturnTarget = StaticAuthReturnTarget | DynamicAuthReturnTarget;

export interface RouteLocationLike {
  pathname: string;
  searchStr?: string | null;
}

interface AuthReturnLocation {
  pathname: AuthReturnTarget;
  search: string | null;
  href: string;
}

interface ParsedRelativeLocation {
  pathname: string;
  search: string | null;
}

interface AuthReturnSearchState {
  returnTo: string | null;
  returnToPath: AuthReturnTarget | null;
  returnToSearch: string | null;
}

function isStaticAuthReturnTarget(
  pathname: string,
): pathname is StaticAuthReturnTarget {
  return authReturnTargets.some((target) => target === pathname);
}

function isDynamicAuthReturnTarget(
  pathname: string,
): pathname is DynamicAuthReturnTarget {
  return (
    /^\/(?:groups|users)\/[^/]+$/.test(pathname) ||
    /^\/admin\/moderation\/cases\/[^/]+$/.test(pathname)
  );
}

function isAuthReturnTarget(pathname: string): pathname is AuthReturnTarget {
  return (
    isStaticAuthReturnTarget(pathname) || isDynamicAuthReturnTarget(pathname)
  );
}

function decodeRouteParam(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function parseRelativeLocation(value: string): ParsedRelativeLocation | null {
  if (!isRelativeLocationValue(value)) {
    return null;
  }

  return splitRelativeLocation(stripLocationHash(value));
}

function isRelativeLocationValue(value: string) {
  return value.startsWith("/") && !value.startsWith("//");
}

function stripLocationHash(value: string) {
  const hashIndex = value.indexOf("#");

  return hashIndex >= 0 ? value.slice(0, hashIndex) : value;
}

function splitRelativeLocation(value: string): ParsedRelativeLocation {
  const searchIndex = value.indexOf("?");

  if (searchIndex < 0) {
    return {
      pathname: value || "/",
      search: null,
    };
  }

  return {
    pathname: value.slice(0, searchIndex) || "/",
    search: value.slice(searchIndex),
  };
}

function getAuthReturnParam(searchString: string) {
  return new URLSearchParams(searchString).get("returnTo");
}

function buildAuthReturnSearchState(
  returnLocation: AuthReturnLocation | null,
): AuthReturnSearchState {
  if (!returnLocation) {
    return {
      returnTo: null,
      returnToPath: null,
      returnToSearch: null,
    };
  }

  return {
    returnTo: returnLocation.href,
    returnToPath: returnLocation.pathname,
    returnToSearch: returnLocation.search,
  };
}

export function buildRouteLocationHref(
  location: RouteLocationLike | null | undefined,
) {
  if (!location) {
    return null;
  }

  return location.searchStr && location.searchStr.length > 0
    ? `${location.pathname}${location.searchStr}`
    : location.pathname;
}

function buildReturnSearchObject(search: string | null | undefined) {
  if (!search) {
    return undefined;
  }

  const entries = Object.fromEntries(new URLSearchParams(search).entries());

  return Object.keys(entries).length > 0 ? entries : undefined;
}

function getDynamicReturnParam(
  pathname: string,
  prefix: "/groups/" | "/users/" | "/admin/moderation/cases/",
) {
  if (!pathname.startsWith(prefix)) {
    return null;
  }

  const param = pathname.slice(prefix.length);

  return param && !param.includes("/") ? decodeRouteParam(param) : null;
}

function buildAuthenticatedReturnNavigation(
  returnLocation: AuthReturnLocation | null,
) {
  if (!returnLocation) {
    return null;
  }

  const search = buildReturnSearchObject(returnLocation.search);
  const groupId = getDynamicReturnParam(returnLocation.pathname, "/groups/");

  if (groupId) {
    return {
      to: "/groups/$groupId",
      params: { groupId },
      search,
    } as const;
  }

  const userId = getDynamicReturnParam(returnLocation.pathname, "/users/");

  if (userId) {
    return {
      to: "/users/$userId",
      params: { userId },
      search,
    } as const;
  }

  const caseId = getDynamicReturnParam(
    returnLocation.pathname,
    "/admin/moderation/cases/",
  );

  if (caseId) {
    return {
      to: "/admin/moderation/cases/$caseId",
      params: { caseId },
      search,
    } as const;
  }

  if (isStaticAuthReturnTarget(returnLocation.pathname)) {
    return {
      to: returnLocation.pathname,
      search,
    } as const;
  }

  return null;
}

function resolveAuthReturnLocation(
  value: string | null | undefined,
): AuthReturnLocation | null {
  if (!value) {
    return null;
  }

  const parsedLocation = parseRelativeLocation(value);

  if (!parsedLocation || !isAuthReturnTarget(parsedLocation.pathname)) {
    return null;
  }

  const search = normalizeRouteSearch(parsedLocation.search);
  const href = search
    ? `${parsedLocation.pathname}?${search}`
    : parsedLocation.pathname;

  return {
    pathname: parsedLocation.pathname,
    search,
    href,
  };
}

export function parseAuthReturnSearch(searchString: string) {
  return buildAuthReturnSearchState(
    resolveAuthReturnLocation(getAuthReturnParam(searchString)),
  );
}

export function useAuthReturnState() {
  const searchStr = useRouterState({
    select: (state) => state.location.searchStr,
  });

  return parseAuthReturnSearch(searchStr);
}

function buildAuthSearch(returnTo: string | null | undefined) {
  const returnLocation = resolveAuthReturnLocation(returnTo);

  if (!returnLocation) {
    return undefined;
  }

  return {
    returnTo: returnLocation.href,
  } as const;
}

export function buildAuthRouteNavigation(
  route: AuthEntryRoute,
  returnTo: string | null | undefined,
) {
  return {
    to: route,
    search: buildAuthSearch(returnTo),
  } as const;
}

export function buildPostAuthRedirectNavigation(
  user: User | null | undefined,
  returnTo: string | null | undefined,
) {
  const canonicalDestination = getPostAuthRedirectPath(user);
  const returnLocation = resolveAuthReturnLocation(returnTo);

  if (canonicalDestination === "/home") {
    return (
      buildAuthenticatedReturnNavigation(returnLocation) ??
      ({
        to: canonicalDestination,
      } as const)
    );
  }

  if (!returnLocation) {
    return {
      to: canonicalDestination,
    } as const;
  }

  return {
    to: canonicalDestination,
    search: {
      returnTo: returnLocation.pathname,
      ...(returnLocation.search ? { returnSearch: returnLocation.search } : {}),
    },
  } as const;
}
