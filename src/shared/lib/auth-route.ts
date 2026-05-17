import { useRouterState } from "@tanstack/react-router";

import type { User } from "@/shared/schemas";

import { getPostAuthRedirectPath } from "./post-auth-route";

const authReturnTargets = [
  "/",
  "/home",
  "/explore",
  "/activity",
  "/profile",
  "/settings",
  "/forge",
  "/onboarding/profile",
  "/onboarding/personality",
  "/onboarding/interests",
] as const;

type StaticAuthReturnTarget = (typeof authReturnTargets)[number];
type DynamicAuthReturnTarget = `/groups/${string}` | `/users/${string}`;
type AuthEntryRoute =
  | "/auth/login"
  | "/auth/register"
  | "/auth/forgot-password";
export type AuthReturnTarget = StaticAuthReturnTarget | DynamicAuthReturnTarget;

export interface RouteLocationLike {
  pathname: string;
  searchStr?: string | null;
}

export interface AuthReturnLocation {
  pathname: AuthReturnTarget;
  search: string | null;
  href: string;
}

function isStaticAuthReturnTarget(
  pathname: string,
): pathname is StaticAuthReturnTarget {
  return authReturnTargets.some((target) => target === pathname);
}

function isDynamicAuthReturnTarget(
  pathname: string,
): pathname is DynamicAuthReturnTarget {
  return /^\/(?:groups|users)\/[^/]+$/.test(pathname);
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

function normalizeReturnSearch(
  value: string | null | undefined,
): string | null {
  if (!value) {
    return null;
  }

  const normalized = new URLSearchParams(
    value.startsWith("?") ? value.slice(1) : value,
  ).toString();

  return normalized.length > 0 ? normalized : null;
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
  prefix: "/groups/" | "/users/",
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

  if (isStaticAuthReturnTarget(returnLocation.pathname)) {
    return {
      to: returnLocation.pathname,
      search,
    } as const;
  }

  return null;
}

export function resolveAuthReturnLocation(
  value: string | null | undefined,
): AuthReturnLocation | null {
  if (!value?.startsWith("/")) {
    return null;
  }

  try {
    const url = new URL(value, "https://teamforge.local");

    if (!isAuthReturnTarget(url.pathname)) {
      return null;
    }

    const search = normalizeReturnSearch(url.search);
    const href = search ? `${url.pathname}?${search}` : url.pathname;

    return {
      pathname: url.pathname,
      search,
      href,
    };
  } catch {
    return null;
  }
}

export function parseAuthReturnSearch(searchString: string) {
  const params = new URLSearchParams(searchString);
  const returnLocation = resolveAuthReturnLocation(params.get("returnTo"));

  return {
    returnTo: returnLocation?.href ?? null,
    returnToPath: returnLocation?.pathname ?? null,
    returnToSearch: returnLocation?.search ?? null,
  };
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
