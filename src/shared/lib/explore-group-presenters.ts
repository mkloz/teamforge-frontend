import type { ExploreGroup } from "@/shared/schemas";

export type ExploreReasonTone = "primary" | "warm" | "muted";

export interface ExploreReasonTag {
  label: string;
  tone: ExploreReasonTone;
}

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

export function getExploreGroupMatchScore(group: ExploreGroup) {
  const score = group.compatibility.total;

  if (score > 0 && score <= 1) {
    return Math.round(score * 100);
  }

  return Math.round(score);
}

export function getExploreGroupDisplayName(group: ExploreGroup) {
  if (!DEMO_GROUP_NAME_PATTERN.test(group.name)) {
    return group.name;
  }

  const category = getCategoryLabel(group);

  return category === "Group" ? "Open group" : `${category} group`;
}

export function getExploreGroupDisplayTitle(group: ExploreGroup) {
  const title = group.plan?.title || group.activity.title;

  if (!DEMO_PLAN_TITLE_PATTERN.test(title)) {
    return title;
  }

  const category = getCategoryLabel(group);
  const location =
    group.plan?.locationMode === "ONLINE"
      ? "online"
      : group.activity.city
        ? `in ${group.activity.city}`
        : "nearby";

  return category === "Group"
    ? `Open plan ${location}`
    : `${category} plan ${location}`;
}

export function getExploreGroupDistanceLabel(group: ExploreGroup) {
  if (group.plan?.locationMode === "ONLINE") {
    return "Online";
  }

  return group.activity.city || "Location pending";
}

export function isExploreGroupFull(group: ExploreGroup) {
  return group.maxMembers > 0 && group.activeMembersCount >= group.maxMembers;
}

export function getExploreGroupFitReason(group: ExploreGroup) {
  const strongest = getStrongestCompatibilityCue(group);
  const planLabel = getExploreGroupDisplayTitle(group);

  if (strongest === "interestOverlap") {
    return `Good fit because ${getInterestLabel(group)} lines up with your interests.`;
  }

  if (strongest === "personalityCompatibility") {
    return "The current members look likely to meet at your pace.";
  }

  if (strongest === "friendshipProximity") {
    return "There is a familiar connection inside this group.";
  }

  if (strongest === "ageAlignment") {
    return "The group is close to your stage of life.";
  }

  if (strongest === "cityAlignment") {
    return `${group.activity.city || "The location"} keeps this practical to join.`;
  }

  if (group.access === "OPEN" && !isExploreGroupFull(group)) {
    return `${planLabel} is open with room to join.`;
  }

  return "A steady opening with enough context to inspect.";
}

export function getExploreGroupReasonTags(group: ExploreGroup) {
  const tags: ExploreReasonTag[] = [];
  const compatibility = group.compatibility;
  const spotsLeft =
    group.maxMembers > 0
      ? Math.max(0, group.maxMembers - group.activeMembersCount)
      : null;

  if (compatibility.interestOverlap >= 0.34) {
    tags.push({ label: "Shared interests", tone: "primary" });
  }

  if (compatibility.personalityCompatibility >= 0.65) {
    tags.push({ label: "Social fit", tone: "primary" });
  }

  if (compatibility.friendshipProximity > 0) {
    tags.push({ label: "Familiar faces", tone: "warm" });
  }

  if (compatibility.ageAlignment >= 0.72) {
    tags.push({ label: "Similar stage", tone: "muted" });
  }

  if (compatibility.cityAlignment >= 0.8) {
    tags.push({
      label: group.plan?.locationMode === "ONLINE" ? "Online" : "Nearby",
      tone: "muted",
    });
  }

  if (group.access === "OPEN" && spotsLeft !== null && spotsLeft > 0) {
    tags.push({
      label: `${spotsLeft} open ${spotsLeft === 1 ? "seat" : "seats"}`,
      tone: "warm",
    });
  }

  if (group.access === "BY_REQUEST" && !isExploreGroupFull(group)) {
    tags.push({ label: "Request needed", tone: "muted" });
  }

  if (tags.length === 0) {
    tags.push({ label: "Worth a look", tone: "muted" });
  }

  return tags.slice(0, 3);
}

function getStrongestCompatibilityCue(group: ExploreGroup) {
  const entries = [
    ["interestOverlap", group.compatibility.interestOverlap],
    ["personalityCompatibility", group.compatibility.personalityCompatibility],
    ["friendshipProximity", group.compatibility.friendshipProximity],
    ["ageAlignment", group.compatibility.ageAlignment],
    ["cityAlignment", group.compatibility.cityAlignment],
  ] as const;

  const [key, score] = entries.reduce((best, current) =>
    current[1] > best[1] ? current : best,
  );

  return score > 0 ? key : null;
}

function getInterestLabel(group: ExploreGroup) {
  const [interest] = group.activity.interests;

  return interest?.name || group.activity.title;
}

function getCategoryLabel(group: ExploreGroup) {
  const category = group.plan?.category ?? "OTHER";

  return CATEGORY_LABELS[category] ?? "Group";
}
