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

type ActivityGroupSearchOptions = {
  panel?: Extract<ActivityPanel, "group">;
  plan?: string;
  proposal?: string;
  message?: string;
};

type ActivityDmSearchOptions = {
  panel?: Extract<ActivityPanel, "profile">;
  message?: string;
};

const EMPTY_ACTIVITY_GROUP_SEARCH_OPTIONS: ActivityGroupSearchOptions = {};
const EMPTY_ACTIVITY_DM_SEARCH_OPTIONS: ActivityDmSearchOptions = {};

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

function parseSearchLiteral<TValues extends readonly string[]>(
  values: TValues,
  value: unknown,
): TValues[number] | undefined {
  return typeof value === "string"
    ? values.find((literal) => literal === value)
    : undefined;
}

function parseActivityFilterSearch(
  value: unknown,
): Exclude<ActivityFilter, "all"> | undefined {
  const filter = parseSearchLiteral(activityFilterValues, value);

  return filter === "all" ? undefined : filter;
}

function parseActivityDensitySearch(
  value: unknown,
): Exclude<ActivityDensity, "default"> | undefined {
  const density = parseSearchLiteral(activityDensityValues, value);

  return density === "default" ? undefined : density;
}

export function validateActivityRouteSearch(
  search: Record<string, unknown>,
): ActivityRouteSearch {
  return {
    q: parseOptionalSearchString(search.q),
    filter: parseActivityFilterSearch(search.filter),
    density: parseActivityDensitySearch(search.density),
    kind: parseSearchLiteral(activityKindValues, search.kind),
    id: parseOptionalSearchString(search.id),
    panel: parseSearchLiteral(activityPanelValues, search.panel),
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

function buildActivityGroupSearch(
  groupId: string,
  options?: ActivityGroupSearchOptions,
) {
  const searchOptions = options ?? EMPTY_ACTIVITY_GROUP_SEARCH_OPTIONS;

  return {
    kind: "group" as const,
    id: groupId,
    panel: searchOptions.panel,
    plan: searchOptions.plan,
    proposal: searchOptions.proposal,
    message: searchOptions.message,
  };
}

export function buildActivityGroupNavigation(
  groupId: string,
  options?: ActivityGroupSearchOptions,
) {
  return buildActivityNavigation(buildActivityGroupSearch(groupId, options));
}

function buildActivityDmSearch(
  chatId: string,
  options?: ActivityDmSearchOptions,
) {
  const searchOptions = options ?? EMPTY_ACTIVITY_DM_SEARCH_OPTIONS;

  return {
    kind: "dm" as const,
    id: chatId,
    panel: searchOptions.panel,
    message: searchOptions.message,
  };
}

export function buildActivityDmNavigation(
  chatId: string,
  options?: ActivityDmSearchOptions,
) {
  return buildActivityNavigation(buildActivityDmSearch(chatId, options));
}

export function buildActivityGroupHubNavigation(groupId: string) {
  return buildActivityGroupNavigation(groupId, {
    panel: "group",
  });
}
