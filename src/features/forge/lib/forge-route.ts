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
  groupId?: string;
  ideaTitle?: string;
  ideaDetail?: string;
  ideaEventDescription?: string;
  ideaLane?: string;
  ideaSecondaryLane?: string;
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
