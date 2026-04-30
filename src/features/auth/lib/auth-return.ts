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
  "/onboarding/personality",
  "/onboarding/interests",
] as const;

type AuthEntryRoute =
  | "/auth/login"
  | "/auth/register"
  | "/auth/forgot-password";
export type AuthReturnTarget = (typeof authReturnTargets)[number];

export interface RouteLocationLike {
  pathname: string;
  searchStr?: string | null;
}

export interface AuthReturnLocation {
  pathname: AuthReturnTarget;
  search: string | null;
  href: string;
}

function isAuthReturnTarget(pathname: string): pathname is AuthReturnTarget {
  return authReturnTargets.includes(pathname as AuthReturnTarget);
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

export function resolveAuthReturnLocation(
  value: string | null | undefined,
): AuthReturnLocation | null {
  if (!value || !value.startsWith("/")) {
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
    return {
      to: returnLocation?.pathname ?? canonicalDestination,
      search: buildReturnSearchObject(returnLocation?.search),
    } as const;
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
