export const forgeSearchModeValues = ["auto", "manual"] as const;

export type ForgeSearchMode = (typeof forgeSearchModeValues)[number];

export interface ForgeRouteSearch {
  open?: true;
  step?: number;
  mode?: ForgeSearchMode;
  activityId?: string;
  groupId?: string;
}

export const forgeLaunchSearch = {
  open: true,
} as const;

export function buildForgeNavigation(search?: ForgeRouteSearch) {
  return {
    to: "/forge",
    search,
  } as const;
}

export function buildForgeLaunchNavigation() {
  return buildForgeNavigation(forgeLaunchSearch);
}
