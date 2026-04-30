export const explorePanelValues = ["friends"] as const;

export type ExplorePanel = (typeof explorePanelValues)[number];

export interface ExploreRouteSearch {
  panel?: ExplorePanel;
  request?: string;
}

export function buildExploreNavigation(search?: ExploreRouteSearch) {
  return {
    to: "/explore",
    search,
  } as const;
}
