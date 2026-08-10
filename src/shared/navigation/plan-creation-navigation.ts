export const groupFormationSearchModeValues = ["auto", "manual"] as const;

export type GroupFormationSearchMode =
  (typeof groupFormationSearchModeValues)[number];

export interface PlanIdeaLaunch {
  detail: string;
  eventDescription?: string | null;
  isTemplateOnly?: boolean;
  laneKey?: string | null;
  secondaryLaneKey?: string | null;
  templateId?: string | null;
  title: string;
}

export interface PlanCreationRouteSearch {
  open?: true;
  step?: number;
  mode?: GroupFormationSearchMode;
  activityId?: string;
  requestId?: string;
  groupId?: string;
  templateId?: string;
  ideaTitle?: string;
  ideaDetail?: string;
  ideaEventDescription?: string;
  ideaLane?: string;
  ideaSecondaryLane?: string;
}

const planCreationRouteStepValues = [1, 2, 3, 4, 5, 6, 7] as const;

const planCreationLaunchSearch = {
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
    planCreationRouteStepValues.some((stepValue) => stepValue === step)
    ? step
    : undefined;
}

function parseRouteOpen(value: unknown) {
  return value === true || value === "true" ? true : undefined;
}

function isGroupFormationSearchMode(
  value: unknown,
): value is GroupFormationSearchMode {
  return (
    typeof value === "string" &&
    groupFormationSearchModeValues.some((mode) => mode === value)
  );
}

export function validatePlanCreationRouteSearch(
  search: Record<string, unknown>,
): PlanCreationRouteSearch {
  return {
    open: parseRouteOpen(search.open),
    step: parseRouteStep(search.step),
    mode: isGroupFormationSearchMode(search.mode) ? search.mode : undefined,
    activityId: parseOptionalSearchString(search.activityId),
    requestId: parseOptionalSearchString(search.requestId),
    groupId: parseOptionalSearchString(search.groupId),
    templateId: parseOptionalSearchString(search.templateId),
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

export function buildPlanCreationNavigation(search?: PlanCreationRouteSearch) {
  return {
    to: "/plans/new",
    search,
  } as const;
}

export function buildPlanCreationLaunchNavigation() {
  return buildPlanCreationNavigation(planCreationLaunchSearch);
}

export function buildGroupProposalNavigation(proposalId: string) {
  return {
    to: "/group-proposals/$proposalId",
    params: { proposalId },
  } as const;
}

export function buildPlanCreationTemplateLaunchNavigation(templateId: string) {
  return buildPlanCreationNavigation({
    open: true,
    step: 3,
    templateId,
  });
}

export function buildPlanIdeaLaunchNavigation(idea: PlanIdeaLaunch) {
  const title = normalizeSearchText(idea.title, MAX_IDEA_TITLE_SEARCH_LENGTH);
  const detail = normalizeSearchText(
    idea.detail,
    MAX_IDEA_DETAIL_SEARCH_LENGTH,
  );
  const eventDescription = normalizeSearchText(
    idea.eventDescription ?? "",
    MAX_IDEA_EVENT_DESCRIPTION_SEARCH_LENGTH,
  );

  return buildPlanCreationNavigation({
    open: true,
    step: 3,
    templateId: idea.templateId ?? undefined,
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
