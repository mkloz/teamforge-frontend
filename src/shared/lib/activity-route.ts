export const activityFilterValues = [
  "all",
  "groups",
  "direct",
  "unread",
] as const;
export const activityDensityValues = ["default", "compact"] as const;
export const activityKindValues = ["group", "dm"] as const;
export const activityPanelValues = ["group", "profile"] as const;

export type ActivityFilter = (typeof activityFilterValues)[number];
export type ActivityDensity = (typeof activityDensityValues)[number];
export type ActivityKind = (typeof activityKindValues)[number];
export type ActivityPanel = (typeof activityPanelValues)[number];

export interface ActivityRouteSearch {
  q?: string;
  filter?: Exclude<ActivityFilter, "all">;
  density?: Exclude<ActivityDensity, "default">;
  kind?: ActivityKind;
  id?: string;
  panel?: ActivityPanel;
  plan?: string;
  proposal?: string;
  message?: string;
}

export function buildActivityNavigation(search?: ActivityRouteSearch) {
  return {
    to: "/activity",
    search,
  } as const;
}

export function buildActivityGroupSearch(
  groupId: string,
  options?: {
    panel?: Extract<ActivityPanel, "group">;
    plan?: string;
    proposal?: string;
    message?: string;
  },
) {
  return {
    kind: "group" as const,
    id: groupId,
    panel: options?.panel,
    plan: options?.plan,
    proposal: options?.proposal,
    message: options?.message,
  };
}

export function buildActivityGroupNavigation(
  groupId: string,
  options?: {
    panel?: Extract<ActivityPanel, "group">;
    plan?: string;
    proposal?: string;
    message?: string;
  },
) {
  return buildActivityNavigation(buildActivityGroupSearch(groupId, options));
}

export function buildActivityDmSearch(
  chatId: string,
  options?: {
    panel?: Extract<ActivityPanel, "profile">;
    message?: string;
  },
) {
  return {
    kind: "dm" as const,
    id: chatId,
    panel: options?.panel,
    message: options?.message,
  };
}

export function buildActivityDmNavigation(
  chatId: string,
  options?: {
    panel?: Extract<ActivityPanel, "profile">;
    message?: string;
  },
) {
  return buildActivityNavigation(buildActivityDmSearch(chatId, options));
}

export function buildActivityGroupHubNavigation(groupId: string) {
  return buildActivityGroupNavigation(groupId, {
    panel: "group",
  });
}
