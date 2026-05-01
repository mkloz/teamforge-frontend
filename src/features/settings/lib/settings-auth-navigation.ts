interface RouteLocationLike {
  pathname: string;
  searchStr?: string | null;
}

function buildRouteLocationHref(
  location: RouteLocationLike | null | undefined,
) {
  if (!location) {
    return null;
  }

  return location.searchStr && location.searchStr.length > 0
    ? `${location.pathname}${location.searchStr}`
    : location.pathname;
}

export function buildSettingsLoginNavigation(
  location: RouteLocationLike | null | undefined,
) {
  const returnTo = buildRouteLocationHref(location);

  return {
    to: "/auth/login",
    search: returnTo ? { returnTo } : undefined,
  } as const;
}
