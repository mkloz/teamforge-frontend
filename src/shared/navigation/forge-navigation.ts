export const forgeSearchModeValues = ["auto", "manual"] as const;

export type ForgeSearchMode = (typeof forgeSearchModeValues)[number];

export interface ForgeIdeaLaunch {
  detail: string;
  eventDescription?: string | null;
  laneKey?: string | null;
  secondaryLaneKey?: string | null;
  title: string;
}

export interface ForgeRouteSearch {
  open?: true;
  step?: number;
  mode?: ForgeSearchMode;
  activityId?: string;
  requestId?: string;
  groupId?: string;
  ideaTitle?: string;
  ideaDetail?: string;
  ideaEventDescription?: string;
  ideaLane?: string;
  ideaSecondaryLane?: string;
}

const forgeRouteStepValues = [1, 2, 3, 4, 5, 6, 7] as const;

const forgeLaunchSearch = {
  open: true,
} as const;

function parseOptionalSearchString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function parseOptionalSearchText(value: unknown, maxLength: number) {
  const parsed = parseOptionalSearchString(value);

  if (parsed === undefined) {
    return undefined;
  }

  const normalized = normalizeSearchText(parsed, maxLength);

  return normalized || undefined;
}

function parseRouteStep(value: unknown): number | undefined {
  const step =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : undefined;

  return typeof step === "number" &&
    forgeRouteStepValues.some((stepValue) => stepValue === step)
    ? step
    : undefined;
}

function parseRouteOpen(value: unknown) {
  return value === true || value === "true" ? true : undefined;
}

function isForgeSearchMode(value: unknown): value is ForgeSearchMode {
  return (
    typeof value === "string" &&
    forgeSearchModeValues.some((mode) => mode === value)
  );
}

export function validateForgeRouteSearch(
  search: Record<string, unknown>,
): ForgeRouteSearch {
  return {
    open: parseRouteOpen(search.open),
    step: parseRouteStep(search.step),
    mode: isForgeSearchMode(search.mode) ? search.mode : undefined,
    activityId: parseOptionalSearchString(search.activityId),
    requestId: parseOptionalSearchString(search.requestId),
    groupId: parseOptionalSearchString(search.groupId),
    ideaTitle: parseOptionalSearchText(
      search.ideaTitle,
      MAX_IDEA_TITLE_SEARCH_LENGTH,
    ),
    ideaDetail: parseOptionalSearchText(
      search.ideaDetail,
      MAX_IDEA_DETAIL_SEARCH_LENGTH,
    ),
    ideaEventDescription: parseOptionalSearchText(
      search.ideaEventDescription,
      MAX_IDEA_EVENT_DESCRIPTION_SEARCH_LENGTH,
    ),
    ideaLane: parseOptionalSearchString(search.ideaLane),
    ideaSecondaryLane: parseOptionalSearchString(search.ideaSecondaryLane),
  };
}

export function buildForgeNavigation(search?: ForgeRouteSearch) {
  return {
    to: "/forge",
    search,
  } as const;
}

export function buildForgeLaunchNavigation() {
  return buildForgeNavigation(forgeLaunchSearch);
}

export function buildForgeIdeaLaunchNavigation(idea: ForgeIdeaLaunch) {
  const title = normalizeSearchText(idea.title, MAX_IDEA_TITLE_SEARCH_LENGTH);
  const detail = normalizeSearchText(
    idea.detail,
    MAX_IDEA_DETAIL_SEARCH_LENGTH,
  );
  const eventDescription = normalizeSearchText(
    idea.eventDescription ?? "",
    MAX_IDEA_EVENT_DESCRIPTION_SEARCH_LENGTH,
  );

  return buildForgeNavigation({
    open: true,
    step: 3,
    ideaTitle: title || "Interest-led small group",
    ideaDetail: detail || undefined,
    ideaEventDescription: eventDescription || undefined,
    ideaLane: idea.laneKey ?? undefined,
    ideaSecondaryLane: idea.secondaryLaneKey ?? undefined,
  });
}

function normalizeSearchText(value: string, maxLength: number) {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return normalized.slice(0, maxLength).trimEnd();
}

const MAX_IDEA_TITLE_SEARCH_LENGTH = 80;
const MAX_IDEA_DETAIL_SEARCH_LENGTH = 180;
const MAX_IDEA_EVENT_DESCRIPTION_SEARCH_LENGTH = 480;
