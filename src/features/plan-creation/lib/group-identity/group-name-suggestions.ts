import {
  CATEGORY_NAME_PROFILES,
  DEFAULT_GROUP_NAMES,
  type GroupNameProfile,
  TOPIC_NAME_PROFILES,
} from "@/features/plan-creation/data/plan-creation-group-name-pools";

const MAX_VISIBLE_SUGGESTIONS = 4;
const MAX_GROUP_NAME_LENGTH = 40;
const LOCATION_SEPARATOR_PATTERN = /\s[-–—]\s/;
const SYNTHETIC_NAME_PATTERN =
  /\b(assembly|bloc|cohort|collective|crew|crucible|flux|planCreation|fusion|guild|pack|radiant|squad|unit)\b/i;

const LOCATION_TOPIC_LABELS: Record<string, string> = {
  arts: "Arts",
  books: "Book",
  climbing: "Climbing",
  coffee: "Coffee",
  comedy: "Comedy",
  cycling: "Cycling",
  dogs: "Dog Walking",
  food: "Food",
  games: "Games",
  learning: "Study",
  music: "Music",
  photography: "Photography",
  product: "Product",
  running: "Running",
  technology: "Tech",
  "team-sport": "Sport",
  walking: "Walking",
  wellbeing: "Wellbeing",
};

export interface BuildGroupNameSuggestionsInput {
  existingGroupNames?: string[];
  planTitle?: string | null;
  selectedActivity?: string | null;
  suggestionCount?: number;
}

export function buildGroupNameSuggestions({
  existingGroupNames = [],
  planTitle,
  selectedActivity,
  suggestionCount = MAX_VISIBLE_SUGGESTIONS,
}: BuildGroupNameSuggestionsInput) {
  const topicProfile = findBestProfile(TOPIC_NAME_PROFILES, planTitle);
  const categoryProfile = findBestProfile(
    CATEGORY_NAME_PROFILES,
    selectedActivity,
  );
  const candidates = [
    ...buildLocationAwareNames(planTitle, topicProfile),
    ...(topicProfile?.names ?? []),
    ...(categoryProfile?.names ?? []),
    ...DEFAULT_GROUP_NAMES,
  ];

  return filterAvailableGroupNames(
    humanizeAndDedupeNames(candidates),
    existingGroupNames,
  ).slice(0, clampSuggestionCount(suggestionCount));
}

export function filterAvailableGroupNames(
  names: string[],
  existingGroupNames: string[],
) {
  const taken = new Set(existingGroupNames.map(normalizeNameKey));

  return names.filter((name) => !taken.has(normalizeNameKey(name)));
}

function findBestProfile(
  profiles: GroupNameProfile[],
  value: string | null | undefined,
) {
  const context = normalizeLookupText(value);

  if (!context) {
    return null;
  }

  let bestProfile: GroupNameProfile | null = null;
  let bestScore = 0;

  for (const profile of profiles) {
    const score = profile.matchTerms.reduce(
      (total, term) => total + getMatchScore(context, term),
      0,
    );

    if (score > bestScore) {
      bestProfile = profile;
      bestScore = score;
    }
  }

  return bestProfile;
}

function getMatchScore(context: string, term: string) {
  const normalizedTerm = normalizeLookupText(term);

  if (!normalizedTerm || !containsWholeTerm(context, normalizedTerm)) {
    return 0;
  }

  return normalizedTerm.split(" ").length * 10 + normalizedTerm.length;
}

function containsWholeTerm(context: string, term: string) {
  return ` ${context} `.includes(` ${term} `);
}

function buildLocationAwareNames(
  planTitle: string | null | undefined,
  topicProfile: GroupNameProfile | null,
) {
  const location = extractLocationSuffix(planTitle);
  const topicLabel = topicProfile
    ? LOCATION_TOPIC_LABELS[topicProfile.id]
    : undefined;

  if (!(location && topicLabel)) {
    return [];
  }

  return [`${location} ${topicLabel} Club`, `${topicLabel} in ${location}`];
}

function extractLocationSuffix(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const parts = value.split(LOCATION_SEPARATOR_PATTERN);
  const candidate = parts.length > 1 ? parts.at(-1)?.trim() : null;

  if (
    !candidate ||
    candidate.length > 24 ||
    !/^[\p{L}][\p{L}\p{M}' .-]*$/u.test(candidate)
  ) {
    return null;
  }

  return candidate;
}

function humanizeAndDedupeNames(names: string[]) {
  const seen = new Set<string>();
  const output: string[] = [];

  for (const candidate of names) {
    const name = humanizeGroupName(candidate);
    const key = normalizeNameKey(name);

    if (!name || seen.has(key)) {
      continue;
    }

    seen.add(key);
    output.push(name);
  }

  return output;
}

function humanizeGroupName(value: string) {
  const name = value
    .replace(/\s+/g, " ")
    .replace(/\s+([,.:;!?])/g, "$1")
    .trim();

  if (
    name.length < 3 ||
    name.length > MAX_GROUP_NAME_LENGTH ||
    SYNTHETIC_NAME_PATTERN.test(name)
  ) {
    return "";
  }

  return name;
}

function normalizeLookupText(value: string | null | undefined) {
  return (
    value
      ?.normalize("NFKD")
      .replace(/\p{M}/gu, "")
      .toLocaleLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .trim()
      .replace(/\s+/g, " ") ?? ""
  );
}

function normalizeNameKey(value: string) {
  return normalizeLookupText(value).replace(/^the\s+/, "");
}

function clampSuggestionCount(value: number) {
  if (!Number.isFinite(value)) {
    return MAX_VISIBLE_SUGGESTIONS;
  }

  return Math.max(1, Math.min(MAX_VISIBLE_SUGGESTIONS, Math.floor(value)));
}
