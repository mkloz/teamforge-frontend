import {
  ACTIVITIES,
  type ActivityOption,
} from "@/features/forge/constants/forge.constants";
import type { Visibility } from "@/features/forge/lib/forge-contract";
import { getFuzzyMatchScore, normalizeSearchText } from "@/shared/lib/fuzzy";
import type { ActivityAccess, PlanCategory } from "@/shared/schemas";

const DESCRIPTION_MATCH_WEIGHT = 0.85;
const MIN_ACTIVITY_MATCH_SCORE = 68;
const MIN_ACTIVITY_MATCH_MARGIN = 6;
const MIN_TOKEN_EVIDENCE_SCORE = 56;
const SUPPORTING_TOKEN_BONUS = 12;
const UNMATCHED_TOKEN_PENALTY = 4;
const DESCRIPTION_FUZZY_DISABLED_IDS = new Set<PlanCategory>(["OTHER"]);
const ACTIVITY_SEMANTIC_TERMS: Partial<Record<PlanCategory, string[]>> = {
  ARTS: [
    "cinema",
    "craft",
    "crafts",
    "exhibition",
    "exhibitions",
    "film",
    "films",
    "gallery",
    "galleries",
    "movie",
    "movies",
    "museum",
    "museums",
    "painting",
    "photography",
    "pottery",
    "screening",
    "theater",
    "theatre",
  ],
  FOOD: [
    "baking",
    "breakfast",
    "cafe",
    "cafes",
    "cook",
    "cooking",
    "dinner",
    "lunch",
    "market",
    "markets",
    "restaurant",
    "restaurants",
    "tasting",
  ],
  GAMING: [
    "arcade",
    "arcades",
    "board game",
    "board games",
    "card games",
    "cards",
    "chess",
    "dnd",
    "esports",
    "tabletop",
    "tabletop games",
    "video game",
    "video games",
  ],
  LEARNING: [
    "book club",
    "course",
    "language exchange",
    "practice",
    "reading",
    "study group",
    "studying",
    "workshop",
    "workshops",
  ],
  MUSIC: [
    "concert",
    "concerts",
    "festival",
    "gig",
    "gigs",
    "jam",
    "jams",
    "karaoke",
    "live music",
    "open mic",
  ],
  OUTDOORS: [
    "bike",
    "biking",
    "camping",
    "cycling",
    "fresh air",
    "hike",
    "hikes",
    "hiking",
    "park",
    "parks",
    "trail",
    "trails",
    "walk",
    "walking",
  ],
  SOCIAL: [
    "brunch",
    "coffee",
    "coffee chat",
    "drinks",
    "hangout",
    "meetup",
    "meetups",
    "networking",
    "party",
    "pub",
    "pub quiz",
    "social",
  ],
  SPORTS: [
    "badminton",
    "basketball",
    "basketball game",
    "bouldering",
    "climbing",
    "football",
    "football game",
    "gym",
    "jogging",
    "padel",
    "run",
    "running",
    "skating",
    "soccer",
    "soccer match",
    "swimming",
    "tennis",
    "tennis match",
    "volleyball",
    "workout",
    "workouts",
  ],
  TECH: [
    "ai",
    "code",
    "coding",
    "demo",
    "demos",
    "hackathon",
    "machine learning",
    "product design",
    "programming",
    "robotics",
    "startup",
    "startups",
    "ui",
    "ux",
  ],
  TRAVEL: [
    "city break",
    "day trip",
    "day trips",
    "discovery",
    "exploring",
    "local gems",
    "road trip",
    "route",
    "routes",
    "sightseeing",
  ],
  WELLNESS: [
    "breathwork",
    "habits",
    "meditation",
    "mindfulness",
    "pilates",
    "recovery",
    "sauna",
    "stretch",
    "stretching",
    "yoga",
  ],
};
const ACTIVITY_STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "for",
  "in",
  "of",
  "on",
  "the",
  "to",
  "with",
]);
const MEANINGFUL_SHORT_ACTIVITY_TOKENS = new Set([
  "2d",
  "3d",
  "ai",
  "ar",
  "dj",
  "ui",
  "ux",
  "vr",
]);

interface ActivityScore {
  option: ActivityOption;
  score: number;
}

interface ActivityScoreRanking {
  bestScore: ActivityScore | null;
  runnerUpScore: ActivityScore | null;
}

export function findActivityOption(selectedActivity: string | null) {
  if (!selectedActivity?.trim()) {
    return null;
  }

  const directMatch = findDirectActivityOption(selectedActivity);

  if (directMatch) {
    return directMatch;
  }

  return findFuzzyActivityOption(selectedActivity);
}

function findDirectActivityOption(selectedActivity: string) {
  const normalizedActivity = normalizeActivityText(selectedActivity);
  const normalizedActivityToken = normalizeActivityToken(selectedActivity);

  return ACTIVITIES.find(
    (activity) =>
      normalizeActivityText(activity.id) === normalizedActivity ||
      normalizeActivityText(activity.label) === normalizedActivity ||
      normalizeActivityToken(activity.label) === normalizedActivityToken,
  );
}

function findFuzzyActivityOption(selectedActivity: string) {
  const normalizedQuery = normalizeSearchText(selectedActivity);
  const queryTokens = getActivitySearchTokens(selectedActivity);

  if (!normalizedQuery || queryTokens.length === 0) {
    return null;
  }

  const ranking = getFuzzyActivityScoreRanking(normalizedQuery, queryTokens);

  return getConfidentActivityOption(ranking);
}

function getFuzzyActivityScoreRanking(
  normalizedQuery: string,
  queryTokens: string[],
): ActivityScoreRanking {
  let ranking: ActivityScoreRanking = {
    bestScore: null,
    runnerUpScore: null,
  };

  for (const option of ACTIVITIES) {
    const score = scoreActivityOption(option, normalizedQuery, queryTokens);

    if (score <= 0) {
      continue;
    }

    ranking = getUpdatedActivityScoreRanking(ranking, { option, score });
  }

  return ranking;
}

function getUpdatedActivityScoreRanking(
  ranking: ActivityScoreRanking,
  score: ActivityScore,
): ActivityScoreRanking {
  if (!ranking.bestScore || score.score > ranking.bestScore.score) {
    return {
      bestScore: score,
      runnerUpScore: ranking.bestScore,
    };
  }

  if (!ranking.runnerUpScore || score.score > ranking.runnerUpScore.score) {
    return {
      ...ranking,
      runnerUpScore: score,
    };
  }

  return ranking;
}

function getConfidentActivityOption({
  bestScore,
  runnerUpScore,
}: ActivityScoreRanking) {
  if (!bestScore || bestScore.score < MIN_ACTIVITY_MATCH_SCORE) {
    return null;
  }

  if (
    runnerUpScore &&
    bestScore.score - runnerUpScore.score < MIN_ACTIVITY_MATCH_MARGIN
  ) {
    return null;
  }

  return bestScore.option;
}

function scoreActivityOption(
  option: ActivityOption,
  normalizedQuery: string,
  queryTokens: string[],
) {
  const canonicalScore = scoreCanonicalActivityOption(
    option,
    normalizedQuery,
    queryTokens,
  );
  const descriptionScore = scoreDescriptionActivityOption(
    option,
    normalizedQuery,
    queryTokens,
  );
  const semanticScore = scoreSemanticActivityOption(
    option,
    normalizedQuery,
    queryTokens,
  );

  return Math.max(canonicalScore, descriptionScore, semanticScore);
}

function scoreCanonicalActivityOption(
  option: ActivityOption,
  normalizedQuery: string,
  queryTokens: string[],
) {
  return Math.max(
    getFuzzyMatchScore(option.id, normalizedQuery),
    getFuzzyMatchScore(option.label, normalizedQuery),
    scoreTokenCoverage(
      getActivitySearchTokens(`${option.id} ${option.label}`),
      queryTokens,
    ),
  );
}

function scoreDescriptionActivityOption(
  option: ActivityOption,
  normalizedQuery: string,
  queryTokens: string[],
) {
  if (DESCRIPTION_FUZZY_DISABLED_IDS.has(option.id)) {
    return 0;
  }

  return (
    Math.max(
      getFuzzyMatchScore(option.description, normalizedQuery),
      scoreTokenCoverage(
        getActivitySearchTokens(option.description),
        queryTokens,
      ),
    ) * DESCRIPTION_MATCH_WEIGHT
  );
}

function scoreSemanticActivityOption(
  option: ActivityOption,
  normalizedQuery: string,
  queryTokens: string[],
) {
  const terms = ACTIVITY_SEMANTIC_TERMS[option.id];

  if (!terms || terms.length === 0) {
    return 0;
  }

  const normalizedTerms = terms.join(" ");

  return Math.max(
    getFuzzyMatchScore(normalizedTerms, normalizedQuery),
    scoreTokenCoverage(getActivitySearchTokens(normalizedTerms), queryTokens),
  );
}

function scoreTokenCoverage(targetTokens: string[], queryTokens: string[]) {
  if (targetTokens.length === 0 || queryTokens.length === 0) {
    return 0;
  }

  let matchedTokenCount = 0;
  let matchedTokenScoreTotal = 0;

  for (const queryToken of queryTokens) {
    const score = getBestTokenScore(targetTokens, queryToken);

    if (score < MIN_TOKEN_EVIDENCE_SCORE) {
      continue;
    }

    matchedTokenCount += 1;
    matchedTokenScoreTotal += score;
  }

  if (matchedTokenCount === 0) {
    return 0;
  }

  const averageMatchedScore = matchedTokenScoreTotal / matchedTokenCount;
  const supportingTokenBonus =
    Math.max(0, matchedTokenCount - 1) * SUPPORTING_TOKEN_BONUS;
  const unmatchedTokenPenalty =
    Math.max(0, queryTokens.length - matchedTokenCount) *
    UNMATCHED_TOKEN_PENALTY;

  return averageMatchedScore + supportingTokenBonus - unmatchedTokenPenalty;
}

function getBestTokenScore(targetTokens: string[], queryToken: string) {
  let bestScore = 0;

  for (const targetToken of targetTokens) {
    bestScore = Math.max(
      bestScore,
      getFuzzyMatchScore(targetToken, queryToken),
    );
  }

  return bestScore;
}

export function resolvePlanCategory(
  selectedActivity: string | null,
): PlanCategory {
  const match = findActivityOption(selectedActivity);

  return match?.id ?? "OTHER";
}

export function resolveActivityAccess(visibility: Visibility): ActivityAccess {
  if (visibility === "PUBLIC") {
    return "OPEN";
  }

  return "BY_REQUEST";
}

export function getActivitySemanticTerms(category: PlanCategory | undefined) {
  return category ? (ACTIVITY_SEMANTIC_TERMS[category] ?? []) : [];
}

function normalizeActivityText(value: string) {
  return normalizeSearchText(value);
}

function normalizeActivityToken(value: string) {
  return normalizeActivityText(value).replaceAll(/[^a-z0-9]+/g, "");
}

function getActivitySearchTokens(value: string) {
  return normalizeSearchText(value)
    .split(/\s+/)
    .filter(isMeaningfulActivityToken);
}

function isMeaningfulActivityToken(token: string) {
  return (
    (token.length >= 3 || MEANINGFUL_SHORT_ACTIVITY_TOKENS.has(token)) &&
    !ACTIVITY_STOP_WORDS.has(token)
  );
}
