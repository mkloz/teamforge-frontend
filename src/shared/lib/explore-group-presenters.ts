import type { ExploreGroup } from "@/shared/schemas";

type CompatibilityCue =
  | "interestOverlap"
  | "friendshipProximity"
  | "ageAlignment"
  | "cityAlignment";

type ExplorePlanLocationMode = NonNullable<
  ExploreGroup["plan"]
>["locationMode"];

const DEMO_GROUP_NAME_PATTERN = /^Benchmark Group \d+$/i;
const DEMO_PLAN_TITLE_PATTERN = /^Benchmark Plan \d+$/i;

const CATEGORY_LABELS: Record<string, string> = {
  ARTS: "Arts",
  FOOD: "Food",
  GAMING: "Gaming",
  LEARNING: "Learning",
  MUSIC: "Music",
  OTHER: "Group",
  OUTDOORS: "Outdoors",
  SOCIAL: "Social",
  SPORTS: "Sports",
  TECH: "Tech",
  TRAVEL: "Travel",
  WELLNESS: "Wellness",
};

const COMPATIBILITY_CUE_KEYS = [
  "interestOverlap",
  "friendshipProximity",
  "ageAlignment",
  "cityAlignment",
] as const satisfies readonly CompatibilityCue[];

const FIT_REASON_BY_CUE: Record<
  CompatibilityCue,
  (group: ExploreGroup) => string
> = {
  interestOverlap: (group) => `Shared interest: ${getInterestLabel(group)}.`,
  friendshipProximity: () => "Someone you already know is in this group.",
  ageAlignment: () => "Members with a public age are close to your age.",
  cityAlignment: (group) =>
    group.plan?.locationMode === "ONLINE"
      ? "This activity is online."
      : "This activity is in the city shown on your profile.",
};

const DISTANCE_LABEL_BY_LOCATION_MODE = {
  IN_PERSON: getInPersonDistanceLabel,
  ONLINE: () => "Online",
  TBD: getTbdDistanceLabel,
} as const satisfies Record<
  ExplorePlanLocationMode,
  (group: ExploreGroup) => string
>;

export function getExploreGroupDisplayName(group: ExploreGroup) {
  if (!DEMO_GROUP_NAME_PATTERN.test(group.name)) {
    return group.name;
  }

  const category = getCategoryLabel(group);

  return category === "Group" ? "Open group" : `${category} group`;
}

export function getExploreGroupDisplayTitle(group: ExploreGroup) {
  const title = getExploreGroupRawTitle(group);

  if (!DEMO_PLAN_TITLE_PATTERN.test(title)) {
    return title;
  }

  return getExploreDemoPlanTitle(group);
}

export function getExploreGroupDistanceLabel(group: ExploreGroup) {
  return DISTANCE_LABEL_BY_LOCATION_MODE[getExplorePlanLocationMode(group)](
    group,
  );
}

export function isExploreGroupFull(group: ExploreGroup) {
  return group.maxMembers > 0 && group.activeMembersCount >= group.maxMembers;
}

export function getExploreGroupFitReason(group: ExploreGroup) {
  const strongest = getStrongestCompatibilityCue(group);
  const planLabel = getExploreGroupDisplayTitle(group);

  if (strongest) {
    return FIT_REASON_BY_CUE[strongest](group);
  }

  if (group.access === "OPEN" && !isExploreGroupFull(group)) {
    return `${planLabel} is open with room to join.`;
  }

  return "Review the plan and members before deciding whether to join.";
}

function getStrongestCompatibilityCue(group: ExploreGroup) {
  const entries = COMPATIBILITY_CUE_KEYS.map((key) =>
    getCompatibilityCueScore(group, key),
  );

  const [key, score] = entries.reduce((best, current) =>
    current[1] > best[1] ? current : best,
  );

  return score > 0 ? key : null;
}

function getCompatibilityCueScore(
  group: ExploreGroup,
  cue: CompatibilityCue,
): readonly [CompatibilityCue, number] {
  return [cue, group.compatibility[cue]];
}

function getExploreGroupRawTitle(group: ExploreGroup) {
  return group.plan?.title || group.activity.title;
}

function getExploreDemoPlanTitle(group: ExploreGroup) {
  return formatExploreDemoPlanTitle(
    getCategoryLabel(group),
    getExplorePlanLocationLabel(group),
  );
}

function formatExploreDemoPlanTitle(category: string, location: string) {
  return category === "Group"
    ? `Open plan ${location}`
    : `${category} plan ${location}`;
}

function getExplorePlanLocationLabel(group: ExploreGroup) {
  if (group.plan?.locationMode === "ONLINE") {
    return "online";
  }

  return group.activity.city ? `in ${group.activity.city}` : "nearby";
}

function getExplorePlanLocationMode(
  group: ExploreGroup,
): ExplorePlanLocationMode {
  return group.plan?.locationMode ?? "IN_PERSON";
}

function getInPersonDistanceLabel(group: ExploreGroup) {
  return group.activity.city || "Location pending";
}

function getTbdDistanceLabel(group: ExploreGroup) {
  return group.activity.city || "Place TBD";
}

function getInterestLabel(group: ExploreGroup) {
  const [interest] = group.activity.interests;

  return interest?.name || group.activity.title;
}

function getCategoryLabel(group: ExploreGroup) {
  const category = group.plan?.category ?? "OTHER";

  return CATEGORY_LABELS[category] ?? "Group";
}
