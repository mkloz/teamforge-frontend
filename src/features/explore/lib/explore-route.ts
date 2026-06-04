export type ExploreRouteSearch = Record<string, never>;

export function buildExploreNavigation(search?: ExploreRouteSearch) {
  return {
    to: "/explore",
    search,
  } as const;
}
