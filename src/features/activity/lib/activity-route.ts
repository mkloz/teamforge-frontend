import { parseAsString, parseAsStringLiteral } from "nuqs";

export const activityFilterValues = [
  "all",
  "groups",
  "direct",
  "unread",
  "pinned",
  "saved",
] as const;
export const activityDensityValues = ["default", "compact"] as const;
export const activityKindValues = ["group", "dm", "saved"] as const;
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

function parseOptionalSearchString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function isActivityFilter(value: unknown): value is ActivityFilter {
  return (
    typeof value === "string" &&
    activityFilterValues.some((filter) => filter === value)
  );
}

function isActivityDensity(value: unknown): value is ActivityDensity {
  return (
    typeof value === "string" &&
    activityDensityValues.some((density) => density === value)
  );
}

function isActivityKind(value: unknown): value is ActivityKind {
  return (
    typeof value === "string" &&
    activityKindValues.some((kind) => kind === value)
  );
}

function isActivityPanel(value: unknown): value is ActivityPanel {
  return (
    typeof value === "string" &&
    activityPanelValues.some((panel) => panel === value)
  );
}

export function validateActivityRouteSearch(
  search: Record<string, unknown>,
): ActivityRouteSearch {
  const filter = isActivityFilter(search.filter) ? search.filter : undefined;
  const density = isActivityDensity(search.density)
    ? search.density
    : undefined;

  return {
    q: parseOptionalSearchString(search.q),
    filter: filter === "all" ? undefined : filter,
    density: density === "default" ? undefined : density,
    kind: isActivityKind(search.kind) ? search.kind : undefined,
    id: parseOptionalSearchString(search.id),
    panel: isActivityPanel(search.panel) ? search.panel : undefined,
    plan: parseOptionalSearchString(search.plan),
    proposal: parseOptionalSearchString(search.proposal),
    message: parseOptionalSearchString(search.message),
  };
}

export const activityRouteParsers = {
  q: parseAsString,
  filter: parseAsStringLiteral(activityFilterValues),
  density: parseAsStringLiteral(activityDensityValues),
  kind: parseAsStringLiteral(activityKindValues),
  id: parseAsString,
  panel: parseAsStringLiteral(activityPanelValues),
  plan: parseAsString,
  proposal: parseAsString,
  message: parseAsString,
};

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
