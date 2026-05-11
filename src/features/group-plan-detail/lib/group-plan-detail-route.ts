export const groupPlanDetailSourceValues = [
  "home",
  "explore",
  "activity",
  "notification",
  "invite",
] as const;

export type GroupPlanDetailSource =
  (typeof groupPlanDetailSourceValues)[number];

export interface GroupPlanDetailRouteSearch {
  source?: GroupPlanDetailSource;
  plan?: string;
  proposal?: string;
  returnTo?: string;
}

export function buildGroupPlanDetailNavigation(
  groupId: string,
  search?: GroupPlanDetailRouteSearch,
) {
  return {
    to: "/groups/$groupId",
    params: {
      groupId,
    },
    search,
  } as const;
}
