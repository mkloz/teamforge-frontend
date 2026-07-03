const groupPlanDetailSourceValues = [
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

export function validateGroupPlanDetailSearch(
  search: Record<string, unknown>,
): GroupPlanDetailRouteSearch {
  return {
    plan: parseOptionalSearchString(search.plan),
    proposal: parseOptionalSearchString(search.proposal),
    returnTo: parseOptionalSearchString(search.returnTo),
    source: isGroupPlanDetailSource(search.source) ? search.source : undefined,
  };
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
